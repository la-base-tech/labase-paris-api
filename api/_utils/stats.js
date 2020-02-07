const faunadb = require('faunadb');
const client = require('./faunadbClient');

const q = faunadb.query;

exports.updateStats = async (env, stats) => {
  await Promise.all(
    Object.keys(stats).map(async name => {
      const ret = await client.query(
        q.Get(q.Match(q.Index('stats_by_environment_and_name'), env, name))
      );
      const newData = Object.assign(ret.data, {
        value: stats[name],
      });
      await client.query(
        q.Update(ret.ref, {
          data: newData,
        })
      );
    })
  );
};

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
