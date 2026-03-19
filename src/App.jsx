import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import lines from './assets/lines.json';
import stations from './assets/stations.json';

const CC_STATIONS = [90004, 90005, 90006, 90007];

function getStations(line, includeCC) {
  if (includeCC) {
    return stations.filter(s => s.Station_Line.indexOf(line) >= 0 && CC_STATIONS.indexOf(s.Station_ID) < 0);
  }
  return stations.filter(s => s.Station_Line.indexOf(line) >= 0 && CC_STATIONS.indexOf(s.Station_ID) >= 0);
}

function ConfigScreen({ line, homeStation, workStation, setHomeStation, setWorkStation, setLine, setCookie, setShowConfig }) {
  const [homeStations, setHome] = useState(getStations(line, true));
  const [workStations, setWork] = useState(getStations(line, false));

  function changeLine(event) {
    const newLine = event.target.selectedOptions[0].id;
    setLine(newLine);
    setHome(getStations(newLine, true));
    setWork(getStations(newLine, false));
  }

  function saveChanges() {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    setCookie('line', line, { path: '/', expires });
    setCookie('home', homeStation, { path: '/', expires });
    setCookie('work', workStation, { path: '/', expires });
    setShowConfig(false);
  }

  function discardChanges() {
    window.location.reload(false);
  }

  return (
    <div className="bg-gray-400 pr-2 pl-2 pt-2 pb-2 shadow-md">
      <div className="flex items-stretch pb-8">
        <span className="flex text-blue-900 font-bold text-md w-2/6">
          Line
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event) => { changeLine(event) }} defaultValue={line}>
            {lines.map(l => (
              <option key={l.Line_ID} id={l.Line_ID} value={l.Line_ID}>{l.Line_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-stretch pb-8 ">
        <span className="flex text-blue-900 font-bold text-md w-2/6">
          Work Station
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event) => { setWorkStation(event.target.value) }} defaultValue={workStation}>
            {workStations.map(station => (
              <option key={station.Station_ID} value={station.Station_Name}>{station.Station_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-stretch pb-8">
        <span className="text-blue-900 font-bold text-md w-2/6">
          Home Station
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event) => { setHomeStation(event.target.value) }} defaultValue={homeStation}>
            {homeStations.map(station => (
              <option key={station.Station_ID} value={station.Station_Name}>{station.Station_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex flex-row justify-between">
        <button onClick={saveChanges} className="text-gray-900 w-auto bg-gray-300 border-gray-500 border-solid border-2 shadow-md mt-4 p-1">Save Changes</button>
        <button onClick={discardChanges} className="text-gray-900 w-auto bg-gray-300 border-gray-500 border-solid border-2 shadow-md mt-4 p-1">Undo Changes</button>
      </div>
    </div>
  );
}

function Delay({ delay }) {
  if (delay === 'On time') {
    return (
      <div className="flex justify-center items-center border-green-400 border-solid border-2 rounded-full w-12 h-12 text-green-700 bg-green-200">
        &#x2713;
      </div>
    );
  } else if (delay === '999 mins') {
    return (
      <div className="flex justify-center items-center border-solid border-red-400 border-2 rounded-full w-12 h-12 text-red-700 bg-red-200">
        &#x0078;
      </div>
    );
  } else {
    const mins = delay.replace(" min", "").replace("s", "");
    return (
      <div className="flex justify-center items-center border-solid border-red-400 border-2 rounded-full w-12 h-12 text-red-700 bg-red-200">
        +{mins}
      </div>
    );
  }
}

function TrainCars({ count }) {
  if (!count || count === 0) return null;
  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-gray-600" style={{ width: '10px', height: '5px' }} />
      ))}
    </div>
  );
}

function TrainInfo({ startStation, endStation, trainDetailsMap }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getTrainTimes() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/.netlify/functions/get-train?start=${encodeURIComponent(startStation)}&end=${encodeURIComponent(endStation)}`);
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError('Failed to load train times. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTrainTimes();
  }, [startStation, endStation]);

  function getCarCount(trainNo) {
    const consist = trainDetailsMap.get(trainNo);
    if (consist) return consist.split(',').filter(c => c.trim()).length;
    return 0;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-700 text-center">
        <p>{error}</p>
        <button onClick={getTrainTimes} className="text-gray-900 bg-gray-300 border-gray-500 border-solid border-2 shadow-md mt-3 p-1">
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return <div>No trains found.</div>;
  }

  return (
    <React.Fragment>
      {data.map(time => (
        <div key={time.orig_train} className="flex flex-row pb-3 pt-3 pr-3 pl-3 mb-5 bg-gray-100 shadow-md justify-between">
          <span className="flex flex-col">
            <div className="text-gray-800 text-xl pb-1">Departs: {time.orig_departure_time}</div>
            <div className="text-gray-800 text-md pl-3">Arrives: {time.orig_arrival_time}</div>
          </span>
          <span className="flex flex-col items-center justify-center">
            <Delay delay={time.orig_delay} />
            <div className="mt-1">
              <TrainCars count={getCarCount(time.orig_train)} />
            </div>
          </span>
        </div>
      ))}
    </React.Fragment>
  );
}

function usePullToRefresh(onRefresh, threshold = 80) {
  const startY = useRef(0);
  const pullDistanceRef = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    function onTouchStart(e) {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    }
    function onTouchMove(e) {
      if (!startY.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        const clamped = Math.min(delta, threshold + 20);
        pullDistanceRef.current = clamped;
        setPullDistance(clamped);
      }
    }
    function onTouchEnd() {
      if (pullDistanceRef.current >= threshold) onRefresh();
      pullDistanceRef.current = 0;
      setPullDistance(0);
      startY.current = 0;
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, threshold]);

  return { pullDistance, ready: pullDistance >= threshold };
}

function App() {
  const [cookies, setCookie] = useCookies(['line', 'home', 'work']);
  const [homeStation, setHomeStation] = useState(cookies.home || 'East Falls');
  const [workStation, setWorkStation] = useState(cookies.work || 'Jefferson Station');
  const [line, setLine] = useState(cookies.line || 'NOR');
  const [showConfig, setShowConfig] = useState(false);
  const [trainDetailsMap, setTrainDetailsMap] = useState(new Map());

  useEffect(() => {
    fetch('/.netlify/functions/get-train-details')
      .then(r => r.json())
      .then(result => {
        setTrainDetailsMap(new Map(result.data.map(t => [t.trainno, t.consist])));
      })
      .catch(() => {}); // non-critical — car counts just won't show
  }, []);

  const onRefresh = useCallback(() => {
    window.location.reload(false);
  }, []);

  const { pullDistance, ready } = usePullToRefresh(onRefresh);

  return (
    <div className="container mx-auto pr-5 pl-5 pt-5">
      {showConfig ? (
        <ConfigScreen
          line={line}
          homeStation={homeStation}
          workStation={workStation}
          setHomeStation={setHomeStation}
          setWorkStation={setWorkStation}
          setLine={setLine}
          setCookie={setCookie}
          setShowConfig={setShowConfig}
        />
      ) : (
        <div>
          <div className="lg:invisible">
            <div className="text-gray-400 font-thin h-5 text-center">
              {pullDistance > 0 ? (ready ? 'Release to refresh' : 'Pull to refresh') : 'Pull to refresh'}
            </div>
          </div>
          <div className="flex flex-col pb-5 pt-5">
            <h1 className="text-blue-900 font-bold text-2xl text-center">
              {homeStation} to {workStation}
            </h1>
            <TrainInfo startStation={homeStation} endStation={workStation} trainDetailsMap={trainDetailsMap} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-blue-900 font-bold text-2xl text-center">
              {workStation} to {homeStation}
            </h1>
            <TrainInfo startStation={workStation} endStation={homeStation} trainDetailsMap={trainDetailsMap} />
          </div>
          <button onClick={() => setShowConfig(true)} aria-label="Change Stations" className="text-gray-600 mt-3 p-1 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
