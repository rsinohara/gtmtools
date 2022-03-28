import React, { useEffect, useState } from 'react';
import './App.css';
import styled from 'styled-components';
import { CONTAINER_FORMAT_WRONG, VALUE_IS_NOT_JSON } from './utils/messages'
import { Container, ContainerSchema } from './utils/Container';
import { compareContainers, ComparisonResult } from './utils/compareContainers';
import ReactJson, { OnSelectProps } from 'react-json-view';
import { any } from 'zod';
import { removeMatchingFields } from './utils/removeMatchingFields';

const VerticalStack = styled.div`
  display: flex;
  margin-top: 45px;
  flex-direction: column;
  justify-content: space-around;  
`

const HorizontalStack = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;  
  align-items: flex-start;
`
const ErrorDisplay = styled.span`
  font-size: 12px;
  color: red;
  text-align: start;
`
const PrimaryButton = styled.button`
  width: 120px;
  padding 5px;
  background-color: turquoise;
`

const ComparisonContainer = styled.div`
  text-align: left;
  font-size: 13px;
  width: 30%
`

const SelectionContainer = styled.div`
  text-align: left;
  font-size: 13px;
  width: 30%;
`

const STORAGE_KEY = 'container-jsons';

function App() {

  const [jsons, setJsons] = useState<{ [k: number]: string }>(() => {

    const saved = localStorage.getItem(STORAGE_KEY);
    try {
      if (saved) {
        const savedContainers = JSON.parse(saved);
        return { 0: JSON.stringify(savedContainers[0]), 1: JSON.stringify(savedContainers[1]) }
      }
    } catch (e) { console.log(e) }

    return { 0: '{}', 1: '{}' }
  });
  const [containers, setContainers] = useState<{ [k: number]: (Container | null) }>({ 0: null, 1: null });
  const [errors, setErrors] = useState<{ [k: number]: string }>({ 0: '', 1: '' });


  const useContainerEffect = (index: number) => {
    const dep = jsons[index];
    useEffect(() => {
      let container: Container | null = null;
      try {
        container = JSON.parse(jsons[index]);
        setErrors((err) => ({ ...err, [index]: '' }))
        try {
          container = ContainerSchema.parse(container);
        } catch (e) {
          console.log(e);
          setErrors((err) => ({ ...err, [index]: CONTAINER_FORMAT_WRONG }))
        }
      } catch (e) {
        setErrors((err) => ({ ...err, [index]: VALUE_IS_NOT_JSON }))
      }
      setContainers((conts) => ({ ...conts, [index]: container }));

    }, [dep, index]);
  }

  useContainerEffect(0);
  useContainerEffect(1);

  const jsonInputChange = (e: HTMLTextAreaElement, i: number) => {
    setJsons({ ...jsons, [i]: e.value })
  }

  const noErrors = !(errors[0] || errors[1]) && containers[0] && containers[1];
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const compare = () => {
    if (noErrors && containers[0] && containers[1]) {
      setComparison(compareContainers(containers[0], containers[1]));
      return;
    }
    setComparison(null);
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(containers))
  }, [containers]);

  const [selectedItem, setSelectedItem] = useState<{ [k: number]: any }>({ 0: null, 1: null })
  const onComparisonSelect = (selectInfo: OnSelectProps) => {

    //We can only open if it's a level 2 item, since those are the IDs of items
    if (selectInfo.namespace.length !== 2) {
      return;
    }

    const elementType = (selectInfo.namespace[0] || '').replace('Changes', '') as 'tag' | 'trigger' | 'folder' | 'variable'

    const items ={
      0: (containers[0]?.containerVersion[elementType] || [] as any).find((c: any) => c[elementType + 'Id'] === selectInfo.value),
      1: (containers[1]?.containerVersion[elementType] || [] as any).find((c: any) => c[elementType + 'Id'] === selectInfo.value),
    }



    setSelectedItem({
      0: {
        value: items[0],
        changedFields: removeMatchingFields(items[0], items[1])
      },
      1: {
        value: items[1],
        changedFields: removeMatchingFields(items[1], items[0])
      }
    })
  }

  return (
    <div className="App">
      <div className="App-header">
        <HorizontalStack>
          <VerticalStack>
            <span>First container</span>
            <textarea rows={10} value={jsons[0]} onChange={e => jsonInputChange(e.target, 0)}></textarea>
            <ErrorDisplay>{errors[0]}</ErrorDisplay>
          </VerticalStack>
          <VerticalStack>
            <span>Second container</span>
            <textarea rows={10} value={jsons[1]} onChange={e => jsonInputChange(e.target, 1)}></textarea>
            <ErrorDisplay>{errors[1]}</ErrorDisplay>
          </VerticalStack>
        </HorizontalStack>
        <PrimaryButton onClick={compare} disabled={!noErrors}>Compare</PrimaryButton>
        {!!comparison &&
          <HorizontalStack>
            <ComparisonContainer>

              <span>This is the result of the comparison. Click one element to open both versions.</span>
              <ReactJson src={comparison}
                onSelect={onComparisonSelect}
                theme="pop"
                displayDataTypes={false}
                collapsed={1}
                enableClipboard={false}
              ></ReactJson>
            </ComparisonContainer>
            <SelectionContainer>
              {!!selectedItem[0] &&
                <ReactJson src={selectedItem[0]}
                  theme="pop"
                  displayDataTypes={true}
                  collapsed={false}
                  enableClipboard={false}
                ></ReactJson>
              }
            </SelectionContainer>
            <SelectionContainer>
              {!!selectedItem[1] &&
                <ReactJson src={selectedItem[1]}
                  theme="pop"
                  displayDataTypes={true}
                  collapsed={false}
                  enableClipboard={false}
                ></ReactJson>
              }
            </SelectionContainer>
          </HorizontalStack>
        }
      </div>
    </div>
  );
}

export default App;
