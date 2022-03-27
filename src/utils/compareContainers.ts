import _ from 'lodash';
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
  const fields: (keyof Container['containerVersion'])[] = ['tag', 'trigger', 'variable', 'folder'];
  return fields.reduce((acc, curr) => ({
    ...acc,
    [curr + 'Changes']: getChanges(fromContainer, toContainer, curr)
  }
  ), {} as ComparisonResult)
}

function getChanges(fromContainer: Container, toContainer: Container, fieldName: keyof Container['containerVersion']): ChangeList {
  const idFieldName = fieldName + 'Id';
  const fromArray = fromContainer.containerVersion[fieldName] as any[];
  const toArray = toContainer.containerVersion[fieldName] as any[];

  const fieldsThatAreSeparatelyChecked = ['name', 'parentFolderId', 'fingerprint']

  return {
    created: findItemsInFirstButNotSecond(toArray, fromArray, idFieldName).map(c => c[idFieldName]),
    deleted: findItemsInFirstButNotSecond(fromArray, toArray, idFieldName).map(c => c[idFieldName]),
    moved: findChangedField(fromArray, toArray, 'parentFolderId', idFieldName).map(c => c[idFieldName]),
    renamed: findChangedField(fromArray, toArray, 'name', idFieldName).map(c => c[idFieldName]),
    otherChanges: findChangedOtherFields(fromArray, toArray, idFieldName, fieldsThatAreSeparatelyChecked)
  }
}

function findItemsInFirstButNotSecond<T extends string, K extends { [key in T]: any }>(firstArray: K[], secondArray: K[], idFieldName: T) {
  return firstArray.filter(c => secondArray.find(d => d[idFieldName] === c[idFieldName]) === undefined);
}

function findChangedField<T extends string, K extends { [key in T]: any }>(firstArray: K[], secondArray: K[], fieldName: T,idFieldName: T) {
  
  return firstArray.filter(firstElement => {
    const secondElement = secondArray.find(d => d[idFieldName] === firstElement[idFieldName]);
    return secondElement && !_.isEqual(secondElement[fieldName], firstElement[fieldName])
  });
}

function findChangedOtherFields<T extends string[], K extends { [key in T[number]]: any }, J extends keyof K>(fromArray: K[], toArray: K[], idFieldName: J, fieldsToIgnore: T) {
  const result: string[] = [];
  fromArray.forEach(firstElement => {
    const secondElement = toArray.find(c => c[idFieldName] === firstElement[idFieldName]);
    if (!secondElement) {
      return;
    }

    const removeProperty = (fieldToRemove: T[number]) => ({ [fieldToRemove]: __, ...rest }) => rest
    const filteredFirstElement = fieldsToIgnore.reduce((acc, fieldToIgnore) => removeProperty(fieldToIgnore)(acc) as any, firstElement);

    const filteredSecondElement = fieldsToIgnore.reduce((acc, fieldToIgnore) => removeProperty(fieldToIgnore)(acc) as any, secondElement);

    if (!_.isEqual(filteredFirstElement, filteredSecondElement)) {
      result.push(firstElement[idFieldName]);
    }

  });

  return result;

}