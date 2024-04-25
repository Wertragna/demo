import './App.css';
import {useEffect, useState} from "react";
import axios from 'axios';
import ShortUrlService from "./services/ShortUrlService";
function App() {
  // const [originalURL, setOriginalURL] = useState('');
  // const [shortenedURL, setShortenedURL] = useState('');

  const [urlToShorten, setUrlToShorten] = useState('')
  const [urls, setUrls] = useState([]);
  const [input, setInput] = useState('')
  const [shortenURL, setShortenURL] = useState('');

  // 3. Create out useEffect function
  useEffect( () => {
    const fetchData = async () => {
      const result = await axios(
          'api/hello-world',
      );
      console.log(result.data)
    }
    fetchData()
  }, [urlToShorten])
  const handleSubmit = async (e) => {
    try {
      ShortUrlService.submitUrl(input).then(result => setShortenURL(result.data));
    } catch (error) {
      console.error('Error shortening URL:', error);
    }
  };

  return (
      <>
        <h1>URL Shortner</h1>
        <input
            type="text"
            value={input}
            onChange={event => setInput(event.target.value)}
        />
        <button type="button" onClick={() => handleSubmit(input)}>
          Shorten
        </button>
        <div>URLS</div>
        <p>{shortenURL}</p>
      </>

  );
}

export default App;

