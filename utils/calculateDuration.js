const TimesheetActivity = require("../models/timeSheetActivityModel");

// @desc: This function clculate time between clockin and clockout
const calculateUserClockinDuration = async (timesheetId, date, userId) => {
  try {
    // Retrieve all events for the given timesheet ID
    const activities = await TimesheetActivity.find({
      timesheet: timesheetId,
      date,
      user: userId,
    })
      .sort("fullDate")
      .exec();

    console.log(`Activities retrieved: ${JSON.stringify(activities)}`.bgGreen);

    // Debug the type of each event
    activities.forEach((event) => console.log(`Event Type: ${event.type}`));

    // Separate clockin and clockout events
    const clockins = activities.filter(
      (event) => event.type.toLowerCase() === "clockin"
    );
    const clockouts = activities.filter(
      (event) => event.type.toLowerCase() === "clockout"
    );

    console.log(`Clockins: ${JSON.stringify(clockins)}`.bgYellow);
    console.log(`Clockouts: ${JSON.stringify(clockouts)}`.bgYellow);

    let totalDurationMs = 0;
    let clockinIndex = 0;

    // Pair each clockin with the next clockout
    clockouts.forEach((clockout) => {
      if (clockinIndex < clockins.length) {
        const clockin = clockins[clockinIndex];
        const clockinDate = new Date(clockin.fullDate);
        const clockoutDate = new Date(clockout.fullDate);

        // Debug date values
        console.log(`Clockin Date: ${clockinDate.toISOString()}`);
        console.log(`Clockout Date: ${clockoutDate.toISOString()}`);

        if (clockoutDate > clockinDate) {
          // Calculate the duration
          const durationMs = clockoutDate - clockinDate;
          totalDurationMs += durationMs;

          // Move to the next clockin for pairing
          clockinIndex++;
        }
      }
    });

    // Convert total duration to hours, minutes, and seconds
    const totalSeconds = Math.floor(totalDurationMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const formattedSeconds = totalSeconds % 60;
    const formattedMinutes = totalMinutes % 60;
    const formattedHours = totalHours;

    console.log(
      `${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`.bgRed
    );
    return `${formattedHours}h ${formattedMinutes}m`;
  } catch (error) {
    console.error("Error calculating total duration:", error);
  }
};

const calculateBreakDuration = async (timesheetId, date, userId) => {
  try {
    // Retrieve all events for the given timesheet ID
    const activities = await TimesheetActivity.find({
      timesheet: timesheetId,
      date,
      user: userId,
    })
      .sort("fullDate")
      .exec();

    console.log(`Activities retrieved: ${JSON.stringify(activities)}`.bgGreen);

    // Debug the type of each event
    activities.forEach((event) => console.log(`Event Type: ${event.type}`));

    // Separate clockin and clockout events
    const clockins = activities.filter(
      (event) => event.type.toLowerCase() === "startbreak"
    );
    const clockouts = activities.filter(
      (event) => event.type.toLowerCase() === "endbreak"
    );

    console.log(`StartBreak: ${JSON.stringify(clockins)}`.bgYellow);
    console.log(`EndBreak: ${JSON.stringify(clockouts)}`.bgYellow);

    let totalDurationMs = 0;
    let clockinIndex = 0;

    // Pair each clockin with the next clockout
    clockouts.forEach((clockout) => {
      if (clockinIndex < clockins.length) {
        const clockin = clockins[clockinIndex];
        const clockinDate = new Date(clockin.fullDate);
        const clockoutDate = new Date(clockout.fullDate);

        // Debug date values
        console.log(`Clockin Date: ${clockinDate.toISOString()}`);
        console.log(`Clockout Date: ${clockoutDate.toISOString()}`);

        if (clockoutDate > clockinDate) {
          // Calculate the duration
          const durationMs = clockoutDate - clockinDate;
          totalDurationMs += durationMs;

          // Move to the next clockin for pairing
          clockinIndex++;
        }
      }
    });

    // Convert total duration to hours, minutes, and seconds
    const totalSeconds = Math.floor(totalDurationMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const formattedSeconds = totalSeconds % 60;
    const formattedMinutes = totalMinutes % 60;
    const formattedHours = totalHours;

    console.log(
      `${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`.bgRed
    );
    return `${formattedHours}h ${formattedMinutes}m`;
  } catch (error) {
    console.error("Error calculating total duration:", error);
  }
};

const calculateAdminlockinDuration = async (timesheetId, date) => {
  try {
    // Retrieve all events for the given timesheet ID
    const activities = await TimesheetActivity.find({
      timesheet: timesheetId,
      date,
    })
      .sort("fullDate")
      .exec();

    console.log(`Activities retrieved: ${JSON.stringify(activities)}`.bgGreen);

    // Debug the type of each event
    activities.forEach((event) => console.log(`Event Type: ${event.type}`));

    // Separate clockin and clockout events
    const clockins = activities.filter(
      (event) => event.type.toLowerCase() === "clockin"
    );
    const clockouts = activities.filter(
      (event) => event.type.toLowerCase() === "clockout"
    );

    console.log(`Clockins: ${JSON.stringify(clockins)}`.bgYellow);
    console.log(`Clockouts: ${JSON.stringify(clockouts)}`.bgYellow);

    let totalDurationMs = 0;
    let clockinIndex = 0;

    // Pair each clockin with the next clockout
    clockouts.forEach((clockout) => {
      if (clockinIndex < clockins.length) {
        const clockin = clockins[clockinIndex];
        const clockinDate = new Date(clockin.fullDate);
        const clockoutDate = new Date(clockout.fullDate);

        // Debug date values
        console.log(`Clockin Date: ${clockinDate.toISOString()}`);
        console.log(`Clockout Date: ${clockoutDate.toISOString()}`);

        if (clockoutDate > clockinDate) {
          // Calculate the duration
          const durationMs = clockoutDate - clockinDate;
          totalDurationMs += durationMs;

          // Move to the next clockin for pairing
          clockinIndex++;
        }
      }
    });

    // Convert total duration to hours, minutes, and seconds
    const totalSeconds = Math.floor(totalDurationMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const formattedSeconds = totalSeconds % 60;
    const formattedMinutes = totalMinutes % 60;
    const formattedHours = totalHours;

    console.log(
      `${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`.bgRed
    );
    return `${formattedHours}h ${formattedMinutes}m`;
  } catch (error) {
    console.error("Error calculating total duration:", error);
  }
};

module.exports = {
  calculateUserClockinDuration,
  calculateAdminlockinDuration,
  calculateBreakDuration,
};
