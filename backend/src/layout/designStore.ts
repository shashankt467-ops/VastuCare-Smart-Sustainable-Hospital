import { GeneratedDesign } from './types.js';

class DesignStore {
  private designs: Map<string, GeneratedDesign> = new Map();
  private activeDesignId: string = '';

  constructor() {
    // No default design on startup; first call to POST /design/generate will populate the store.
    // getActiveDesign() returns undefined until a design is generated.
  }

  public getActiveDesign(): GeneratedDesign | undefined {
    if (!this.activeDesignId) return undefined;
    return this.designs.get(this.activeDesignId);
  }

  public getDesignById(id: string): GeneratedDesign | undefined {
    return this.designs.get(id);
  }

  public getAllDesigns(): GeneratedDesign[] {
    return Array.from(this.designs.values());
  }

  public saveDesign(design: GeneratedDesign): GeneratedDesign {
    this.designs.set(design.id, design);
    this.activeDesignId = design.id;
    return design;
  }

  public setActiveDesign(id: string): boolean {
    if (this.designs.has(id)) {
      this.activeDesignId = id;
      return true;
    }
    return false;
  }
}

export const designStore = new DesignStore();
