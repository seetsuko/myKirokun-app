import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@chakra-ui/button';
import { Box, Flex, Text } from '@chakra-ui/react';
import { url } from '../const';
import { LoginStatusContext } from '../App';

type Artical = {
  id: string;
  title: string;
};

export const Counter = () => {
  const { loading, token } = useContext(LoginStatusContext);
  const [list, setList] = useState<Artical[]>([]);
  const [selectListId, setSelectListId] = useState('');
  const [selectTitle, setSelectTitle] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');

  const login = token !== '';
  // console.log(token);
  console.log(list);

  useEffect(() => {
    if (login) {
      axios
        .get(`${url}/do_lists`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setList(res.data);
          setSelectListId(res.data.at(0)?.id);
          setSelectTitle(res.data.at(0)?.title);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [token]);

  useEffect(() => {
    const fetch = async () => {
      if (selectListId !== '') {
        await axios
          .get(`${url}/do_lists/${selectListId}/time_logs`, {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            // console.log(res.data)
            setTimestamp(res.data.at(-1)?.time);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };
    fetch();
  }, [selectListId]);

  useEffect(() => {
    // タイムスタンプからの経過時間を計算
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

  // リストを選んだらidとtitleのstateへセットする
  const handleSelectList = (data: any) => {
    // console.log(data.id);
    // console.log(data.title);
    setSelectListId(data.id);
    setSelectTitle(data.title);
    setElapsedTime('');
  };

  const handleUpdateTimestamp = () => {
    const time = dayjs().format('YYYY/MM/DD HH:mm:ss');
    const data = { time: time };
    axios
      .post(`${url}/do_lists/${selectListId}/time_logs`, data, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTimestamp(time);
        setElapsedTime('');
        console.log('POST完了！');
      });
  };

  return (
    <Box>
      {!loading && (
        <Box textAlign="center" p={50} bg="#fefefe" h="88vh">
          {login ? (
            <Box>
              <Box m={3} mb={8} textAlign="center">
                <Text mb={4} fontSize="xl">
                  リスト一覧
                </Text>
                <ul className="list-tab" role="tablist" aria-label="リスト一覧">
                  {list.map((data) => {
                    const isActive = data.id === selectListId;
                    return (
                      <li
                        tabIndex={0}
                        role="tab"
                        key={data.id}
                        className={`list-tab-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectList(data)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleSelectList(data);
                          }
                        }}
                      >
                        {data.title}
                      </li>
                    );
                  })}
                </ul>
                <Flex
                  w="200px"
                  justifyContent="space-between"
                  m="20px auto"
                  color="#1715ac"
                >
                  <Box mr={3} borderBottom="solid 1px" w="120px" as="b">
                    <Link to="/list_create">リスト作成</Link>
                  </Box>
                  {selectListId !== '' && (
                    <Box borderBottom="solid 1px" w="120px" as="b">
                      <Link
                        to={`list/${selectListId}/edit`}
                        state={{ selectTitle }}
                      >
                        リスト編集
                      </Link>
                    </Box>
                  )}
                </Flex>
              </Box>

              <Box
                w="100%"
                h="30vh"
                rounded={40}
                p={4}
                borderWidth="1px"
                borderColor="gray"
              >
                <Box mt={5}>
                  <Text>前回ボタンを押した時間</Text>
                  <Text as="b">{timestamp}</Text>
                </Box>
                <Box mt={4} mb={5}>
                  <Text>経過時間</Text>
                  <Text as="b">{elapsedTime}</Text>
                </Box>
                <Box
                  borderBottom="solid 1px"
                  w="120px"
                  m="0 auto"
                  color="#1715ac"
                  as="b"
                >
                  <Link
                    to={`time_list/${selectListId}`}
                    state={{ selectTitle }}
                  >
                    過去のキロク
                  </Link>
                </Box>
              </Box>
              <Button
                variant="solid"
                fontSize={{ base: 'xl', lg: '3xl' }}
                bgColor="#7bdbe6"
                borderBottom="solid 5px #4d618d"
                borderRadius="10px"
                mt="24px"
                size={{ base: 'lg' }}
                onClick={handleUpdateTimestamp}
              >
                のんだ！
              </Button>
            </Box>
          ) : (
            <Navigate to="/login" />
          )}
        </Box>
      )}
    </Box>
  );
};
