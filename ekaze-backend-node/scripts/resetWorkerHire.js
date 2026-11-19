const { Employment, Worker, HiringRequest } = require('../models');

async function reset() {
  try {
    // Remove active employments for Worker #11
    const deleted = await Employment.destroy({
      where: { worker_id: 11 }
    });
    console.log(`✓ Deleted ${deleted} employment record(s) for Worker #11.`);

    // Reset worker availability status
    await Worker.update(
      { availability_status: 'available' },
      { where: { id: 11 } }
    );
    console.log('✓ Worker #11 availability reset to "available".');

    // Reset any hiring requests
    await HiringRequest.update(
      { status: 'pending' },
      { where: { worker_id: 11 } }
    );
    console.log('✓ Hiring request for Worker #11 reset to "pending".');

    console.log('🎉 Successfully reset! Worker #11 is now back in "Not Yet Signed".');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset error:', err.message);
    process.exit(1);
  }
}

reset();
