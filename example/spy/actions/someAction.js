import { customReaction } from "../reactions/customReaction";

export const someAction = () => {
  type: `SOME_ACTION_TYPE`,
  payload: `test`,
  spy: {
    log: true,
    onLog: customReaction
  }
}