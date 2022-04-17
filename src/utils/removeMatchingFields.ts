import _ from "lodash";

export const removeMatchingFields = (mainObject: {[k: string]: any}, otherObject: {[k: string]: any}): object => {

  if (!mainObject ) {
    return otherObject;
  }

  if (!otherObject) {
    return mainObject;
  }
  const allKeys = [...Object.keys(mainObject), ...Object.keys(otherObject)]
  return allKeys.reduce((acc, currKey) =>
    _.isEqual( mainObject[currKey], otherObject[currKey]) ? acc : { ...acc, [currKey]: mainObject[currKey] }
    , {});
}