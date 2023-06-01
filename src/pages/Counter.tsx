import axios from 'axios';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/button';
import { Box, Text } from '@chakra-ui/react';

type Artical = {
  id: string;
  time: string;
};
const urlAPI = 'http://localhost:3100/timer';

export const Counter = () => {
  const [timestamp, setTimestamp] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');
  const [dataLog, setDataLog] = useState<Artical>();
  const loading = timestamp === undefined;

  useEffect(() => {
    axios.get(urlAPI).then((res) => {
      setDataLog(res.data);
      res.data.map((data: Artical) => {
        setTimestamp(data.time);
      });
    });
  }, []);

  useEffect(() => {
    if (timestamp !== '') {
      const interval = setInterval(() => {
        const now = dayjs().format('YYYY/MM/DD HH:mm:ss');
        const diffHour = dayjs(now).diff(dayjs(timestamp), 'hour');
        const diffMin = dayjs(now).diff(dayjs(timestamp), 'minute');
        const diffSec = dayjs(now).diff(dayjs(timestamp), 'second');
        setElapsedTime(`${diffHour}時間${diffMin % 60}分${diffSec % 60}秒`);
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [timestamp]);

  console.log(dataLog);
  console.log(timestamp);

  const increment = () => {
    const time = dayjs().format('YYYY/MM/DD HH:mm:ss');
    setElapsedTime('');
    axios
      .post(urlAPI, {
        time,
      })
      .then((res) => {
        setTimestamp(time);
        console.log('POST完了！');
      });
  };

  return (
    <Box textAlign="center" p={30} bg="#f7ffe5" h="100vh">
      <Box
        w="100%"
        h="30vh"
        rounded="md"
        p={4}
        borderWidth="1px"
        borderColor="gray"
      >
        <Box mt={5}>
          <Text as="b">前回ボタンを押した時間</Text>
          <br />
          <Text as="samp">{timestamp}</Text>
        </Box>
        <Box mt={5}>
          <Text as="b">経過時間</Text>
          <br />
          <Text as="samp">{elapsedTime}</Text>
        </Box>
      </Box>
      <Button
        colorScheme="blue"
        mt="24px"
        size={{ base: 'lg' }}
        onClick={increment}
      >
        のんだ！
      </Button>
    </Box>
  );
};