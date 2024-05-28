import CSVReader from 'react-csv-reader';
import './App.css';
import { useEffect, useState } from 'react';
import { readString } from 'react-papaparse';

const defaultFacebookImgSrc =
  'https://scontent.fuln6-2.fna.fbcdn.net/v/t1.30497-1/143086968_2856368904622192_1959732218791162458_n.png?stp=dst-png_p120x120&_nc_cat=1&ccb=1-7&_nc_sid=5f2048&_nc_ohc=2WKUFuMRZfAQ7kNvgEeITsO&_nc_ht=scontent.fuln6-2.fna&oh=00_AYBkfaWZBhZk-ccL28NlTby-uMRRr8aADvaZG4_MsT5jFQ&oe=667D0CF8';

interface FBMember {
  profileId: string;
  fullName: string;
  profileLink: string;
  bio: string;
  imageSrc: string;
  groupId: string;
  groupJoiningText: string;
  profileType: string;
  botChance: number;
}

interface BotAnalysis {
  bot80: number;
  bot50: number;
  bot20: number;
  bot0: number;
}

function App() {
  const [data, setData] = useState<FBMember[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [botAnalysis, setBotAnalysis] = useState<BotAnalysis>({ bot80: 0, bot50: 0, bot20: 0, bot0: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileLoaded = (data: string[]) => {
    setLoading(true);
    data.shift();
    data.pop();
    const members: FBMember[] = data.map((row: any) => {
      return {
        profileId: row[0],
        fullName: row[1],
        profileLink: row[2],
        bio: row[3],
        imageSrc: row[4],
        groupId: row[5],
        groupJoiningText: row[6],
        profileType: row[7],
        botChance: 0,
      };
    });
    setData(members);
    setLoading(false);
  };

  const getBotPercentage = (user: FBMember) => {
    let botPercentage = 0;
    if (user.imageSrc === defaultFacebookImgSrc) {
      botPercentage += 20;
    }
    if (user.bio === '') {
      botPercentage += 30;
    }
    if (user.profileType === 'page') {
      botPercentage += 50;
    }

    return botPercentage;
  };

  const handleProgressColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'danger';
    } else if (percentage >= 50) {
      return 'attention';
    } else {
      return 'success';
    }
  };

  const fetchAndSetData = async (file: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/data/${file}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const csvText = await response.text();

      readString(csvText, {
        header: true,
        complete: (results) => {
          results.data.shift();
          results.data.pop();
          const members: FBMember[] = results.data.map((row: any) => {
            return {
              profileId: row['Profile ID'],
              fullName: row['Full Name'],
              profileLink: row['Profile Link'],
              bio: row['Bio'],
              imageSrc: row['ImageSrc'],
              groupId: row['GroupId'],
              groupJoiningText: row['Group Joining Text'],
              profileType: row['Profile Type'],
              botChance: 0,
            };
          });
          setData(members);
          setLoading(false);
        },
      });
    } catch (e) {
      console.error('There was a problem with the fetch operation:', e);
      setLoading(false);
    }
  };
  const handleOption = (group: string) => () => {
    if (group === 'Golden') {
      const file = 'golden-budda-users.csv';
      fetchAndSetData(file);
      setSelectedGroup('Golden');
    } else if (group === 'Songinohairhan') {
      const file = 'songinohairhan-users.csv';
      fetchAndSetData(file);
      setSelectedGroup('Songinohairhan');
    }
  };

  useEffect(() => {
    const botAnalysis = data.reduce(
      (acc, user) => {
        if (getBotPercentage(user) >= 80) {
          acc.bot80++;
        } else if (getBotPercentage(user) >= 50) {
          acc.bot50++;
        } else if (getBotPercentage(user) >= 20) {
          acc.bot20++;
        } else {
          acc.bot0++;
        }
        return acc;
      },
      { bot80: 0, bot50: 0, bot20: 0, bot0: 0 }
    );
    setBotAnalysis(botAnalysis);
  }, [data]);

  return (
    <main>
      <CSVReader label='.csv файл оруулна уу.' onFileLoaded={(data) => handleFileLoaded(data)} />
      <hr />
      <div>
        <button onClick={handleOption('Golden')} className={selectedGroup === 'Golden' ? 'active' : ''}>
          Голден Будда хотхон
        </button>
        <button onClick={handleOption('Songinohairhan')} className={selectedGroup === 'Songinohairhan' ? 'active' : ''}>
          Сонгинохайрхан дүүрэг
        </button>
      </div>
      <hr />
      <section id='main'>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Зураг</th>
                <th>Бүтэн нэр</th>
                <th>Профайл линк</th>
                <th>Бот байх магадлал</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data.map((member, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <img src={member.imageSrc} alt='профайл зураг' />
                    </td>
                    <td>{member.fullName}</td>
                    <td>
                      <a href={member.profileLink} target='_blank' rel='noreferrer'>
                        профайл үзэх
                        {/* <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 512 512'
                      fill='#fff'
                      width='16px'
                      height='16px'>
                      <path d='M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z' />
                    </svg> */}
                      </a>
                    </td>
                    <td>
                      {getBotPercentage(member)}%
                      <progress
                        value={getBotPercentage(member)}
                        max='100'
                        className={handleProgressColor(getBotPercentage(member))}></progress>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {loading && <div>Уншиж байна...</div>}
        </div>
        <aside id='analysis'>
          <h2>Бот Анализ</h2>
          <h3>Бот байх магадлалтай хэрэглэгчид:</h3>
          <p>80%-н магадлал: {botAnalysis.bot80}</p>
          <p>50%-н магадлал: {botAnalysis.bot50}</p>
          <p>20%-н магадлал: {botAnalysis.bot20}</p>
          <p>0%-н магадлалт: {botAnalysis.bot0}</p>
        </aside>
      </section>
    </main>
  );
}

export default App;
