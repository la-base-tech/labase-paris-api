const faunadb = require('faunadb');
const client = require('./faunadbClient');

const q = faunadb.query;

exports.getStats = async env => {
  const response = await client.query(
    q.Paginate(q.Match(q.Index('stats_by_environment'), env))
  );

  const getStatsDataQuery = response.data.map(ref => {
    return q.Get(ref);
  });

  const stats = await client.query(getStatsDataQuery);

  const statsObj = stats
    .map(stat => {
      return {
        name: stat.data.name,
        value: stat.data.value,
      };
    })
    .reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {});

  return statsObj;
};
