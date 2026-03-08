const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const result = await db.collection('courses').updateOne(
    { slug: 'install-vscode-windows' },
    {
      $set: {
        modules: [
          {
            title: 'VS Code Installation on Windows',
            duration: '45 minutes',
            topics: [
              'Check system requirements for VS Code',
              'Download installer from official website',
              'Install and launch Visual Studio Code',
              'Set default shell and workspace settings',
            ],
            videoUrl: 'https://www.youtube.com/embed/B-s71n0dHUk',
          },
        ],
      },
    }
  );

  const updated = await db.collection('courses').findOne(
    { slug: 'install-vscode-windows' },
    { projection: { title: 1, slug: 1, modules: 1 } }
  );

  console.log(
    JSON.stringify(
      {
        modifiedCount: result.modifiedCount,
        course: updated,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
