import { Container } from './Container';

export type ChangeList = {
  renamed: string[],
  deleted: string[],
  created: string[],
  moved: string[],
  otherChanges: string[],
}

export type ComparisonResult = {
  tagChanges: ChangeList,
  triggerChanges: ChangeList,
  folderChanges: ChangeList,
  variableChanges: ChangeList,
}

const makeEmptyChangeList = () => ({
  renamed: [],
  deleted: [],
  created: [],
  moved: [],
  otherChanges: [],
})

export const compareContainers = (fromContainer: Container, toContainer: Container): ComparisonResult => {


  return {
    tagChanges: makeEmptyChangeList(),
    triggerChanges: makeEmptyChangeList(),
    folderChanges: makeEmptyChangeList(),
    variableChanges: makeEmptyChangeList(),
  }
}