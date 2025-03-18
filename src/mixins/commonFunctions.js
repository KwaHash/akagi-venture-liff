import moment from 'moment';

export default {
  /** location.hostから環境取得 */
  getEnvironment() {
    let result = {};
    const host = location.host;
    if (host.includes('dev')) result = { name: 'develop' };
    else if (host.includes('ngrok') || host.includes('localhost')) result = { name: 'local' };
    else result = { name: 'production' };
    result.host = { host }
    return result;
  },

  methods: {
    /** タイムスタンプのフォーマット */
    formatTimestamp(stamp, format = 'YYYY-MM-DD') {
      let result = moment(stamp, 'X').format(format);
      if (!String(stamp).includes('GMT')) {
        result = moment(stamp).format(format);
      }
      return result;
    },
  },
}
