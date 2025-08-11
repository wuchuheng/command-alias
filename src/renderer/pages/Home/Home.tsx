import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  useTranslation();
  const navigate = useNavigate();
  const goToAbout = () => {
    navigate('/about');
  };

  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  useEffect(() => {
    window.electron.welcome.getWelcome().then(res => {
      setWelcomeMessage(res.title);
    });
  }, []);

  return <>hello</>;
};
