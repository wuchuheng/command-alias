import { useEffect, useState } from 'react';
import { Progress } from 'antd';
import packageJson from '../../../package.json';
import logo from '../assets/logo.png';
import { BootloadingProgressing } from '../../types/electron';

type BootloadingProps = {
  children: React.ReactNode;
};

export const Spin: React.FC<BootloadingProgressing> = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5">
      <img className="h-32 w-32" src={logo} />

      <h1 className="text-3xl font-bold text-primary-600">{packageJson.productName}</h1>
      <Progress className="w-80" />
    </div>
  );
};

export const Bootloading: React.FC<BootloadingProps> = ({ children }) => {
  const [processing, setProcessing] = useState<BootloadingProgressing>({ progress: 0, title: '' });

  useEffect(() => {
    console.log('Bootloading');
  }, []);

  const getProgress = async (): Promise<BootloadingProgressing> => {
    const result = await window.electron.system.getBootloadProgressing();
    return result;
  };

  useEffect(() => {
    getProgress().then(result => {
      setProcessing(result);
    });

    return window.electron.system.bootloading(value => {
      setProcessing(value);
    });
  }, []);

  return processing.progress != 100 ? <Spin {...processing} /> : <>{children}</>;
};
