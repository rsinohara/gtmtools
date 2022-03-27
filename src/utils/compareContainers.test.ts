import { Container } from './Container';
import { compareContainers, ComparisonResult, ChangeList } from './compareContainers';
import { Folder, Tag, Trigger, Variable } from "./Container"
import { DeepPartial } from './DeepPartial';


type containerFixture = {
  triggers?: Partial<Trigger>[],
  tags?: Partial<Tag>[],
  folders?: Partial<Folder>[],
  variables?: Partial<Variable>[],
}

type fixture = {
  name?: string,
  fromContainer: containerFixture,
  toContainer: containerFixture,
  expectedChanges?: DeepPartial<ComparisonResult>,
}

const fixtures: fixture[] = [];

const createContainerFromFixture = (fixture: containerFixture): DeepPartial<Container> => ({
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
    const comparison = compareContainers(fromContainer as Container, toContainer as Container);
    describe.each(['tag', 'trigger', 'folder', 'variable'])('Detects the correct number of changes for %ss', (itemType) => {

      const changeListFields = ['renamed', 'deleted', 'created', 'moved', 'otherChanges'] as (keyof ChangeList)[];
      it.each(changeListFields)('for the field %s', (field) => {
        const changesField = (itemType + 'Changes') as keyof ComparisonResult;
        const expectedChangeList = ((fixture?.expectedChanges || {})[changesField] || {}) as ChangeList;
        const expectedValue = (expectedChangeList[field as keyof ChangeList] || [])
        expect(comparison[changesField][field]).toEqual(expectedValue)
      });
    });
  });
});

fixtures.push({
  name: 'Empty containers',
  fromContainer: {},
  toContainer: {},
});

fixtures.push({
  name: 'One of each element added',
  fromContainer: {},
  toContainer: {
    tags: [{ tagId: 'tag-1234' }],
    triggers: [{ triggerId: 'trigger-1234' }],
    variables: [{ variableId: 'variable-1234' }],
    folders: [{ folderId: 'folder-1234' }],
  },
  expectedChanges: {
    tagChanges: { created: ['tag-1234'] },
    triggerChanges: { created: ['trigger-1234'] },
    variableChanges: { created: ['variable-1234'] },
    folderChanges: { created: ['folder-1234'] }
  }
});

fixtures.push({
  name: 'One of each element removed',
  fromContainer: {
    tags: [{ tagId: 'tag-1234' }],
    triggers: [{ triggerId: 'trigger-1234' }],
    variables: [{ variableId: 'variable-1234' }],
    folders: [{ folderId: 'folder-1234' }],
  },
  toContainer: {},
  expectedChanges: {
    tagChanges: { deleted: ['tag-1234'] },
    triggerChanges: { deleted: ['trigger-1234'] },
    variableChanges: { deleted: ['variable-1234'] },
    folderChanges: { deleted: ['folder-1234'] }
  }
});

fixtures.push({
  name: 'One existing element and another one added',

  fromContainer: {
    tags: [{ tagId: 'tag-1234' }],
    triggers: [{ triggerId: 'trigger-1234' }],
    variables: [{ variableId: 'variable-1234' }],
    folders: [{ folderId: 'folder-1234' }],
  },
  toContainer: {
    tags: [{ tagId: 'tag-1234' }, { tagId: 'tag2-1234' }],
    triggers: [{ triggerId: 'trigger-1234' }, { triggerId: 'trigger2-1234' }],
    variables: [{ variableId: 'variable-1234' }, { variableId: 'variable2-1234' }],
    folders: [{ folderId: 'folder-1234' }, { folderId: 'folder2-1234' }],
  },
  expectedChanges: {
    tagChanges: { created: ['tag2-1234'] },
    triggerChanges: { created: ['trigger2-1234'] },
    variableChanges: { created: ['variable2-1234'] },
    folderChanges: { created: ['folder2-1234'] }
  }
});

fixtures.push({
  name: 'Two existing elements, one deleted',
  fromContainer: {
    tags: [{ tagId: 'tag-1234' }, { tagId: 'tag2-1234' }],
    triggers: [{ triggerId: 'trigger-1234' }, { triggerId: 'trigger2-1234' }],
    variables: [{ variableId: 'variable-1234' }, { variableId: 'variable2-1234' }],
    folders: [{ folderId: 'folder-1234' }, { folderId: 'folder2-1234' }],
  },
  toContainer: {
    tags: [{ tagId: 'tag-1234' }],
    triggers: [{ triggerId: 'trigger-1234' }],
    variables: [{ variableId: 'variable-1234' }],
    folders: [{ folderId: 'folder-1234' }],
  },
  expectedChanges: {
    tagChanges: { deleted: ['tag2-1234'] },
    triggerChanges: { deleted: ['trigger2-1234'] },
    variableChanges: { deleted: ['variable2-1234'] },
    folderChanges: { deleted: ['folder2-1234'] }
  }
});

fixtures.push({
  name: 'One of each element (except folder) moved',
  fromContainer: {
    tags: [{ tagId: 'tag-1234', parentFolderId: '1' }],
    triggers: [{ triggerId: 'trigger-1234', parentFolderId: '1' }],
    variables: [{ variableId: 'variable-1234', parentFolderId: '1' }],
    folders: [{ folderId: 'folder-1234' }],
  },
  toContainer: {
    tags: [{ tagId: 'tag-1234', parentFolderId: '2' }],
    triggers: [{ triggerId: 'trigger-1234', parentFolderId: '2' }],
    variables: [{ variableId: 'variable-1234', parentFolderId: '2' }],
    folders: [{ folderId: 'folder-1234' }],
  },
  expectedChanges: {
    tagChanges: { moved: ['tag-1234'] },
    triggerChanges: { moved: ['trigger-1234'] },
    variableChanges: { moved: ['variable-1234'] },
  }
});

fixtures.push({
  name: 'Other fields changed',
  fromContainer: {
    tags: [{ tagId: 'tag-1234', accountId: '1' }],
    triggers: [{ triggerId: 'trigger-1234', accountId: '1' }],
    variables: [{ variableId: 'variable-1234', accountId: '1' }],
    folders: [{ folderId: 'folder-1234', accountId: '1' }],
  },
  toContainer: {
    tags: [{ tagId: 'tag-1234', accountId: '2' }],
    triggers: [{ triggerId: 'trigger-1234', accountId: '2' }],
    variables: [{ variableId: 'variable-1234', accountId: '2' }],
    folders: [{ folderId: 'folder-1234', accountId: '2' }],
  },
  expectedChanges: {
    tagChanges: { otherChanges: ['tag-1234'] },
    triggerChanges: { otherChanges: ['trigger-1234'] },
    variableChanges: { otherChanges: ['variable-1234'] },
    folderChanges: { otherChanges: ['folder-1234'] }

  }
});

runTestsAfterFixtureSetup()
export { }