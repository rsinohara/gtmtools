import { Container } from './Container';
import { compareContainers, ComparisonResult, ChangeList } from './compareContainers';
import { Folder, Tag, Trigger, Variable } from "./Container"

type containerFixture = {
  triggers?: Trigger[],
  tags?: Tag[],
  folders?: Folder[],
  variables?: Variable[],
}

type fixture = {
  name?: string,
  fromContainer: containerFixture,
  toContainer: containerFixture,
  expectedChanges?: Partial<ComparisonResult>,
}

const fixtures: fixture[] = [];

const createContainerFromFixture = (fixture: containerFixture): Container => ({
  containerVersion: {
    trigger: fixture.triggers || [],
    tag: fixture.tags || [],
    folder: fixture.folders || [],
    variable: fixture.variables || [],
  }
})
const runTestsAfterFixtureSetup = () => describe('Compare containers', () => {

  describe.each(fixtures)('Fixture $name', (fixture) => {
    const fromContainer = createContainerFromFixture(fixture.fromContainer);
    const toContainer = createContainerFromFixture(fixture.toContainer);
    const comparison = compareContainers(fromContainer, toContainer);
    console.log(comparison);

    describe.each(['tag', 'trigger', 'folder', 'variable'])('Detects the correct number of changes for %ss', (itemType) => {

      const changeFields = ['renamed', 'deleted', 'created', 'moved', 'otherChanges'] as (keyof ChangeList)[];
      it.each(changeFields)('for the field %s', (field) => {
        const changesField = (itemType + 'Changes') as keyof ComparisonResult;
        const expectedChangeList = ((fixture?.expectedChanges || {})[changesField] || {}) as ChangeList;
        const expectedValue = (expectedChangeList[field as keyof ChangeList] || []).length
        expect(comparison[changesField][field].length).toEqual(expectedValue)
      });
    });
  });
});

fixtures.push({
  name: 'Empty containers',
  fromContainer: {},
  toContainer: {},
})


runTestsAfterFixtureSetup()
export { }