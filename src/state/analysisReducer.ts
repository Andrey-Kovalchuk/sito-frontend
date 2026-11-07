import type { AnalysisResult, AnalysisState, FieldErrors, MessageInput, Verdict } from '../types';

export type AnalysisAction =
  | { type: 'SUBMIT_VALID'; input: MessageInput }
  | { type: 'SUBMIT_INVALID'; errors: FieldErrors }
  | { type: 'INPUT_CHANGED' }
  | { type: 'RESOLVE'; result: AnalysisResult }
  | { type: 'REJECT'; message: string }
  | { type: 'CANCEL' }
  | { type: 'START_EDIT' }
  | { type: 'APPLY_EDIT'; manualVerdict: Verdict; note: string }
  | { type: 'CANCEL_EDIT' }
  | { type: 'SAVE'; recordId: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

export const initialAnalysisState: AnalysisState = { status: 'idle' };

export function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (state.status) {
    case 'idle': {
      if (action.type === 'SUBMIT_VALID') {
        return { status: 'analyzing', input: action.input };
      }
      if (action.type === 'SUBMIT_INVALID') {
        return { status: 'invalid', errors: action.errors };
      }
      return state;
    }

    case 'invalid': {
      if (action.type === 'INPUT_CHANGED') {
        return { status: 'idle' };
      }
      if (action.type === 'SUBMIT_VALID') {
        return { status: 'analyzing', input: action.input };
      }
      if (action.type === 'SUBMIT_INVALID') {
        return { status: 'invalid', errors: action.errors };
      }
      return state;
    }

    case 'analyzing': {
      if (action.type === 'RESOLVE') {
        return {
          status: 'result',
          input: state.input,
          result: action.result,
        };
      }
      if (action.type === 'REJECT') {
        return {
          status: 'error',
          input: state.input,
          message: action.message,
        };
      }
      if (action.type === 'CANCEL') {
        return { status: 'idle' };
      }
      return state;
    }

    case 'result': {
      if (action.type === 'START_EDIT') {
        return {
          status: 'editing',
          input: state.input,
          result: state.result,
          manualVerdict: state.manualVerdict,
          note: state.note,
        };
      }
      if (action.type === 'SAVE') {
        return {
          status: 'saved',
          recordId: action.recordId,
        };
      }
      if (action.type === 'RESET') {
        return { status: 'idle' };
      }
      return state;
    }

    case 'editing': {
      if (action.type === 'APPLY_EDIT') {
        return {
          status: 'result',
          input: state.input,
          result: state.result,
          manualVerdict: action.manualVerdict,
          note: action.note.trim() ? action.note.trim() : undefined,
        };
      }
      if (action.type === 'CANCEL_EDIT') {
        return {
          status: 'result',
          input: state.input,
          result: state.result,
          manualVerdict: state.manualVerdict,
          note: state.note,
        };
      }
      return state;
    }

    case 'saved': {
      if (action.type === 'RESET') {
        return { status: 'idle' };
      }
      return state;
    }

    case 'error': {
      if (action.type === 'RETRY') {
        return {
          status: 'analyzing',
          input: state.input,
        };
      }
      if (action.type === 'RESET') {
        return { status: 'idle' };
      }
      return state;
    }
  }
}
