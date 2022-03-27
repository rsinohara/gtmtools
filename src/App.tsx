import React, { useEffect, useState } from 'react';
import './App.css';
import styled from 'styled-components';
import { CONTAINER_FORMAT_WRONG, VALUE_IS_NOT_JSON } from './utils/messages'
import { ContainerSchema } from './utils/Container';

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

const JsonInput = styled.textarea`

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

function App() {

  const [jsons, setJsons] = useState<{ [k: number]: string }>({ 0: '{}', 1: '{}' });
  const [containers, setContainers] = useState<{ [k: number]: object }>({ 0: {}, 1: {} });
  const [errors, setErrors] = useState<{ [k: number]: string }>({ 0: '', 1: '' });

  
  const useContainerEffect = (index: number) => {
    const dep = jsons[index];
    useEffect(() => {
      let container = {};
      try {
        container = JSON.parse(jsons[index]);
        setErrors((err) => ({ ...err, [index]: '' }))
        try {
          container = ContainerSchema.parse(container);
        } catch (e) {
          setErrors((err) => ({ ...err, [index]: CONTAINER_FORMAT_WRONG }))
        }
      } catch (e) {
        setErrors((err) => ({ ...err, [index]: VALUE_IS_NOT_JSON }))
      }
      setContainers((conts) => ({ ...conts, [index]: container }))

    }, [dep, index]);
  }

  useContainerEffect(0);
  useContainerEffect(1);

  const jsonInputChange = (e: HTMLTextAreaElement, i: number) => {
    setJsons({ ...jsons, [i]: e.value })
  }

  const compare = () => {

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
        <PrimaryButton onClick={compare} disabled={!!(errors[0] || errors[1])}>Compare</PrimaryButton>
      </div>
    </div>
  );
}

export default App;
