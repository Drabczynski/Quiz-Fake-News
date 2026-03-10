/**
 * SCORM 2004 API Wrapper
 */

interface ScormAPI {
  Initialize: (param: string) => string;
  Terminate: (param: string) => string;
  GetValue: (element: string) => string;
  SetValue: (element: string, value: string) => string;
  Commit: (param: string) => string;
  GetLastError: () => string;
  GetErrorString: (errorCode: string) => string;
  GetDiagnostic: (errorCode: string) => string;
}

class Scorm2004 {
  private api: ScormAPI | null = null;
  private initialized = false;

  constructor() {
    this.api = this.findAPI(window);
    if (!this.api && window.opener) {
      this.api = this.findAPI(window.opener);
    }
  }

  private findAPI(win: any): ScormAPI | null {
    let findAttempts = 0;
    let currentWin = win;
    
    while (currentWin) {
      try {
        if (currentWin.API_1484_11) {
          return currentWin.API_1484_11;
        }
      } catch (e) {
        // Security error or other access issue
      }
      
      if (currentWin.parent && currentWin.parent !== currentWin) {
        currentWin = currentWin.parent;
      } else {
        break;
      }
      
      findAttempts++;
      if (findAttempts > 50) break; // Safety break
    }
    
    // Try opener if not found in parent chain
    if (win.opener) {
      try {
        if (win.opener.API_1484_11) {
          return win.opener.API_1484_11;
        }
      } catch (e) {}
    }

    return null;
  }

  public init(): boolean {
    if (this.initialized) return true;
    if (this.api) {
      try {
        const result = this.api.Initialize("");
        if (result === "true") {
          this.initialized = true;
          return true;
        }
      } catch (e) {
        console.error("SCORM Initialize failed", e);
      }
    }
    return false;
  }

  public terminate(): boolean {
    if (!this.initialized || !this.api) return false;
    try {
      const result = this.api.Terminate("");
      this.initialized = false;
      return result === "true";
    } catch (e) {
      console.error("SCORM Terminate failed", e);
      return false;
    }
  }

  public get(element: string): string {
    if (!this.initialized || !this.api) return "";
    try {
      return this.api.GetValue(element);
    } catch (e) {
      console.error("SCORM GetValue failed", e);
      return "";
    }
  }

  public set(element: string, value: string): boolean {
    if (!this.initialized || !this.api) return false;
    try {
      const result = this.api.SetValue(element, value);
      return result === "true";
    } catch (e) {
      console.error("SCORM SetValue failed", e);
      return false;
    }
  }

  public commit(): boolean {
    if (!this.initialized || !this.api) return false;
    try {
      const result = this.api.Commit("");
      return result === "true";
    } catch (e) {
      console.error("SCORM Commit failed", e);
      return false;
    }
  }

  public setScore(raw: number, min: number, max: number, scaled: number) {
    this.set("cmi.score.raw", raw.toString());
    this.set("cmi.score.min", min.toString());
    this.set("cmi.score.max", max.toString());
    this.set("cmi.score.scaled", scaled.toString());
    this.commit();
  }

  public setCompletionStatus(status: "completed" | "incomplete" | "not attempted" | "unknown") {
    this.set("cmi.completion_status", status);
    this.commit();
  }

  public setSuccessStatus(status: "passed" | "failed" | "unknown") {
    this.set("cmi.success_status", status);
    this.commit();
  }

  public setExitStatus(status: "logout" | "suspend" | "normal" | "") {
    this.set("cmi.exit", status);
    this.commit();
  }

  public setObjective(id: string, description: string, score: number, status: "passed" | "failed" | "unknown") {
    // SCORM 2004 objectives use a collection
    // We'll use index 0 for our unique objective
    this.set("cmi.objectives.0.id", id);
    this.set("cmi.objectives.0.description", description);
    this.set("cmi.objectives.0.score.scaled", score.toString());
    this.set("cmi.objectives.0.success_status", status);
    this.commit();
  }

  private interactionOffset = 0;

  public resetInteractions() {
    // We store the current count as an offset so new interactions 
    // start from a fresh index in our internal logic, 
    // though they still append to the LMS list.
    // To truly "reset", we'd need the LMS to support new attempts.
    this.interactionOffset = parseInt(this.get("cmi.interactions._count") || "0");
    console.log("Interactions session reset. Offset:", this.interactionOffset);
  }

  private sanitize(str: string): string {
    return str.replace(/"/g, "'");
  }

  public recordInteraction(
    id: string,
    type: "true-false" | "choice" | "fill-in" | "long-fill-in" | "matching" | "performance" | "sequencing" | "likert" | "numeric" | "other",
    description: string,
    learnerResponse: string,
    result: "correct" | "incorrect" | "unanticipated" | "neutral" | number,
    correctResponse?: string,
    objectiveId?: string
  ) {
    // Find the next available interaction index
    const count = parseInt(this.get("cmi.interactions._count") || "0");
    const index = count.toString();

    this.set(`cmi.interactions.${index}.id`, this.sanitize(id));
    this.set(`cmi.interactions.${index}.type`, type);
    this.set(`cmi.interactions.${index}.description`, this.sanitize(description));
    this.set(`cmi.interactions.${index}.learner_response`, this.sanitize(learnerResponse));
    this.set(`cmi.interactions.${index}.result`, result.toString());
    if (correctResponse) {
      this.set(`cmi.interactions.${index}.correct_responses.0.pattern`, this.sanitize(correctResponse));
    }
    if (objectiveId) {
      this.set(`cmi.interactions.${index}.objectives.0.id`, objectiveId);
    }
    this.set(`cmi.interactions.${index}.timestamp`, new Date().toISOString());
    
    this.commit();
  }
}

export const scorm = new Scorm2004();
