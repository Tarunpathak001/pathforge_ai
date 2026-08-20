export interface GraphEdge {
  skillId: string; // The skill that has a prerequisite
  prerequisiteSkillId: string; // The prerequisite skill needed
}

export interface GraphValidationResult {
  isValid: boolean;
  error?: string;
  cycle?: string[];
}

/**
 * Validates a new prerequisite relationship before adding it to a graph.
 * In our model: `skillId` REQUIRES `prerequisiteSkillId`.
 * This means learning flow is `prerequisiteSkillId` -> `skillId`.
 * Adding an edge where `skillId` requires `prerequisiteSkillId` creates a directed dependency:
 * `skillId -> prerequisiteSkillId`.
 * A cycle occurs if there is already a path from `prerequisiteSkillId` to `skillId`
 * (meaning `prerequisiteSkillId` already depends on `skillId` directly or indirectly).
 */
export function validatePrerequisiteEdge(
  newEdge: GraphEdge,
  existingEdges: GraphEdge[]
): GraphValidationResult {
  // 1. Prevent self-prerequisite
  if (newEdge.skillId === newEdge.prerequisiteSkillId) {
    return {
      isValid: false,
      error: `Self-prerequisite is invalid: Skill '${newEdge.skillId}' cannot be a prerequisite of itself.`,
    };
  }

  // 2. Prevent duplicate edge
  const isDuplicate = existingEdges.some(
    e => e.skillId === newEdge.skillId && e.prerequisiteSkillId === newEdge.prerequisiteSkillId
  );
  if (isDuplicate) {
    return {
      isValid: false,
      error: `Duplicate prerequisite: Skill '${newEdge.skillId}' already has prerequisite '${newEdge.prerequisiteSkillId}'.`,
    };
  }

  // 3. Cycle Detection:
  // Check if adding skillId -> prerequisiteSkillId creates a cycle.
  // In the dependency graph (where A -> B means A requires B), a path from prerequisiteSkillId to skillId
  // means prerequisiteSkillId already requires skillId. Adding skillId -> prerequisiteSkillId would complete the loop.
  const cycle = findPath(newEdge.prerequisiteSkillId, newEdge.skillId, existingEdges);
  if (cycle) {
    const fullCycle = [...cycle, newEdge.prerequisiteSkillId];
    return {
      isValid: false,
      error: `Circular dependency detected: ${fullCycle.join(' -> ')}`,
      cycle: fullCycle,
    };
  }

  return { isValid: true };
}

/**
 * Finds a directed path from `startNode` to `targetNode` using BFS.
 * Edges represent `skillId -> prerequisiteSkillId`.
 * Returns the path array if found, or null if no path exists.
 */
export function findPath(
  startNode: string,
  targetNode: string,
  edges: GraphEdge[]
): string[] | null {
  // Build adjacency list: node -> prerequisites
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.skillId)) {
      adj.set(edge.skillId, []);
    }
    adj.get(edge.skillId)!.push(edge.prerequisiteSkillId);
  }

  const queue: Array<{ node: string; path: string[] }> = [{ node: startNode, path: [startNode] }];
  const visited = new Set<string>([startNode]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.node === targetNode) {
      return current.path;
    }

    const neighbors = adj.get(current.node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          node: neighbor,
          path: [...current.path, neighbor],
        });
      }
    }
  }

  return null;
}

/**
 * Validates an entire graph of edges for any cycles (e.g. at seed time).
 * Returns true if acyclic (DAG), or throws/returns error with cycle details.
 */
export function validateFullGraph(edges: GraphEdge[]): GraphValidationResult {
  const adj = new Map<string, string[]>();
  const allNodes = new Set<string>();

  for (const edge of edges) {
    if (edge.skillId === edge.prerequisiteSkillId) {
      return {
        isValid: false,
        error: `Self-prerequisite detected: ${edge.skillId}`,
      };
    }
    allNodes.add(edge.skillId);
    allNodes.add(edge.prerequisiteSkillId);

    if (!adj.has(edge.skillId)) {
      adj.set(edge.skillId, []);
    }
    adj.get(edge.skillId)!.push(edge.prerequisiteSkillId);
  }

  // Detect cycle using DFS with 3-color state (0 = unvisited, 1 = visiting, 2 = visited)
  const state = new Map<string, number>();
  const parent = new Map<string, string>();

  function dfs(node: string, currentPath: string[]): string[] | null {
    state.set(node, 1); // visiting

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      const neighborState = state.get(neighbor) || 0;
      if (neighborState === 1) {
        // Cycle found
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          return [...currentPath.slice(cycleStartIndex), node, neighbor];
        }
        return [node, neighbor];
      }
      if (neighborState === 0) {
        parent.set(neighbor, node);
        const cycle = dfs(neighbor, [...currentPath, node]);
        if (cycle) return cycle;
      }
    }

    state.set(node, 2); // visited
    return null;
  }

  for (const node of allNodes) {
    if ((state.get(node) || 0) === 0) {
      const cycle = dfs(node, []);
      if (cycle) {
        return {
          isValid: false,
          error: `Circular dependency detected in graph: ${cycle.join(' -> ')}`,
          cycle,
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Performs topological sort on skills based on prerequisite dependencies.
 * Learning order: prerequisites first, advanced skills last.
 */
export function topologicalSortSkills(skillIds: string[], edges: GraphEdge[]): string[] {
  // In learning order, if A requires B (edge: A -> B), B must be learned before A (B -> A in learning order).
  const inDegree = new Map<string, number>();
  const learningAdj = new Map<string, string[]>(); // B -> [A] (B unlocks A)

  for (const id of skillIds) {
    inDegree.set(id, 0);
    learningAdj.set(id, []);
  }

  for (const edge of edges) {
    if (inDegree.has(edge.skillId) && inDegree.has(edge.prerequisiteSkillId)) {
      // skillId requires prerequisiteSkillId => prerequisiteSkillId must come before skillId
      inDegree.set(edge.skillId, (inDegree.get(edge.skillId) || 0) + 1);
      learningAdj.get(edge.prerequisiteSkillId)!.push(edge.skillId);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const dependents = learningAdj.get(current) || [];
    for (const dep of dependents) {
      const newDeg = (inDegree.get(dep) || 0) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) {
        queue.push(dep);
      }
    }
  }

  // If there were unvisited nodes (due to outside dependencies or cycles), append remaining
  if (result.length < skillIds.length) {
    for (const id of skillIds) {
      if (!result.includes(id)) {
        result.push(id);
      }
    }
  }

  return result;
}
