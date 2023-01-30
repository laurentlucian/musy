import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import { Text, Select, useColorModeValue, useColorMode } from '@chakra-ui/react';

const TimeRangePicker = () => {
  const color = useColorModeValue('black', 'white');
  const { setColorMode } = useColorMode();

  const [time, setTime] = useState(new Date());
  const seconds = [...Array(60)].map((_, i) => i);
  const hours = [...Array(12)].map((_, i) => i + 1);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('time');
  const [search, setSearch] = useState(searchDefault ?? '');

  const ref = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (time.getHours() === 12 && time.getMinutes() === 0 && time.getSeconds() === 0) {
    setColorMode('light');
  }
  if (time.getHours() === 12 && time.getMinutes() === 0 && time.getSeconds() === 0) {
    setColorMode('dark');
  }

  return (
    <Form ref={ref} method="put" action="schedule">
      <Text>light</Text>
      <Select placeholder="--" variant="unstyled" iconSize="0" border={`1px solid ${color}`}>
        {hours.map((hour) => {
          // If the hour is less than 10, add a 0 prefix
          let newHour = hour < 10 ? '0' + hour : hour;
          return (
            <>
              <option key={newHour} value={newHour}>
                {newHour}
              </option>
            </>
          );
        })}
      </Select>
      <Select placeholder="--" variant="unstyled" iconSize="0" border={`1px solid ${color}`}>
        {seconds.map((second) => {
          // If the second is less than 10, add a 0 prefix
          let newSecond = second < 10 ? '0' + second : second;
          return (
            <>
              <option key={newSecond} value={newSecond}>
                {newSecond}
              </option>
            </>
          );
        })}
      </Select>
      <Select placeholder="--" variant="unstyled" border={`1px solid ${color}`}>
        <option>AM</option>
        <option>PM</option>
      </Select>
      <Text>dark</Text>
      <Select placeholder="--" variant="unstyled" iconSize="0" border={`1px solid ${color}`}>
        {hours.map((hour) => {
          // If the hour is less than 10, add a 0 prefix
          let newHour = hour < 10 ? '0' + hour : hour;
          return (
            <>
              <option key={newHour} value={newHour}>
                {newHour}
              </option>
            </>
          );
        })}
      </Select>
      <Select placeholder="--" variant="unstyled" iconSize="0" border={`1px solid ${color}`}>
        {seconds.map((second) => {
          // If the second is less than 10, add a 0 prefix
          let newSecond = second < 10 ? '0' + second : second;
          return (
            <>
              <option key={newSecond} value={newSecond}>
                {newSecond}
              </option>
            </>
          );
        })}
      </Select>
      <Select placeholder="--" variant="unstyled" border={`1px solid ${color}`}>
        <option>AM</option>
        <option>PM</option>
      </Select>
    </Form>
  );
};
export default TimeRangePicker;
