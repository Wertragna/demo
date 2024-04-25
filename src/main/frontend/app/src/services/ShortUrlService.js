import axios from 'axios';

const $api = axios.create()
class ShortUrlService {
  static async submitUrl(url) {
    return $api.post(`/shorten?url=${url}`);
  }
}
export default ShortUrlService;