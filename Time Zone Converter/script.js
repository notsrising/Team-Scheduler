// JavaScript for dropdown toggle
document.addEventListener("DOMContentLoaded", function () {
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownContent = document.getElementById("dropdownContent");

  // Toggle dropdown visibility on click
  dropdownToggle.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent click from bubbling up to document
    dropdownContent.classList.toggle("show-dropdown");
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", function (event) {
    if (!dropdownContent.contains(event.target) && !dropdownToggle.contains(event.target)) {
      dropdownContent.classList.remove("show-dropdown");
    }
  });
  
  // Define the team members with their respective time zones and locations
  const teamMembers = [
    { name: 'Allie', zone: 'America/Los_Angeles', location: 'San Francisco' },
    { name: 'Melanie', zone: 'America/Los_Angeles', location: 'Los Angeles' },
    { name: 'Page', zone: 'America/Los_Angeles', location: 'Reno' },
    { name: 'Ryan', zone: 'America/Los_Angeles', location: 'San Francisco' },
    { name: 'Elly', zone: 'America/Los_Angeles', location: 'San Francisco' },
    { name: 'Devonta', zone: 'America/New_York', location: 'New York City' },
    { name: 'Joy', zone: 'America/New_York', location: 'New York City' },
    { name: 'Scott', zone: 'America/New_York', location: 'New York City' },
    { name: 'Rafa', zone: 'America/Sao_Paulo', location: 'Sao Paulo' },
    { name: 'Henrina', zone: 'Europe/Paris', location: 'Paris' },
    { name: 'Dennis', zone: 'Europe/Berlin', location: 'Berlin' },
    { name: 'Britt', zone: 'Australia/Sydney', location: 'Sydney' },
    { name: 'Rose', zone: 'Europe/London', location: 'London' },
    { name: 'Aston', zone: 'Europe/London', location: 'London' },
    { name: 'Kamilah', zone: 'America/Los_Angeles', location: 'San Francisco' },
    { name: 'Jeremiah', zone: 'America/Los_Angeles', location: 'Huntington Beach' },
    { name: 'Christina', zone: 'America/Los_Angeles', location: 'Los Angeles' },
    { name: 'Hiteshi', zone: 'Asia/Kolkata', location: 'Mumbai' },
    { name: 'Keilyn', zone: 'America/New_York', location: 'New York City' }
  ];

  const teamGroups = {
    International: ['Henrina', 'Rafa', 'Aston', 'Hiteshi', 'Britt', 'Dennis'],
    Content: ['Ryan', 'Scott', 'Devonta', 'Rose', 'Joy', 'Keilyn'],
    'Community Management': ['Allie', 'Kamilah', 'Christina'],
    'Center of Excellence': ['Page', 'Elly'],
    Leads: ['Melanie', 'Ryan', 'Allie', 'Page', 'Jeremiah']
  };

  // Populate team member checkboxes
  const teamCheckboxes = document.getElementById('teamCheckboxes');
  teamMembers.forEach((member, index) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `member-${index}`;
    checkbox.checked = true;
    checkbox.dataset.name = member.name;

    const label = document.createElement('label');
    label.htmlFor = `member-${index}`;
    label.textContent = member.name;

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    teamCheckboxes.appendChild(div);
  });

  // Set the input time to the user’s current time in their local time zone
  const now = new Date();
  document.getElementById('localTime').value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  document.getElementById('timeZone').value = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Function to handle group selection logic
  function handleGroupSelection() {
    const selectedGroups = Array.from(document.querySelectorAll('.group-checkbox:checked')).map(checkbox => checkbox.value);
    const selectedMembers = new Set();

    // Gather all members in selected groups
    selectedGroups.forEach(group => {
      teamGroups[group].forEach(member => selectedMembers.add(member));
    });

    // Update team checkboxes based on selected groups or select all if no groups are selected
    teamMembers.forEach((member, index) => {
      const checkbox = document.getElementById(`member-${index}`);
      checkbox.checked = selectedGroups.length === 0 || selectedMembers.has(member.name);
    });
  }

  // Add event listener to group checkboxes
  document.querySelectorAll('.group-checkbox').forEach(groupCheckbox => {
    groupCheckbox.addEventListener('change', handleGroupSelection);
  });

  // Event listener for "Check Team Availability" button
  document.getElementById('convertBtn').addEventListener('click', checkTeamAvailability);

  // Function to check team availability based on the selected time and time zone
  function checkTeamAvailability() {
    const localTime = document.getElementById('localTime').value;
    const timeZone = document.getElementById('timeZone').value;

    if (!localTime) {
      alert('Please enter a valid time.');
      return;
    }

    // Parse the local time input
    const [hours, minutes] = localTime.split(':');
    const localDate = new Date();
    localDate.setHours(parseInt(hours));
    localDate.setMinutes(parseInt(minutes));

    const results = document.getElementById('results');
    results.innerHTML = ''; // Clear previous results

    let goodCount = 0;
    let okCount = 0;
    let badCount = 0;

    // Iterate through selected team members and calculate availability
    const selectedMembers = Array.from(document.querySelectorAll('#teamCheckboxes input:checked')).map(checkbox => {
      const memberName = checkbox.dataset.name;
      const member = teamMembers.find(m => m.name === memberName);

      const options = { timeZone: member.zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h12' };
      const memberLocalTime = localDate.toLocaleTimeString('en-US', options);

      const memberHours = new Date(localDate.toLocaleString('en-US', { timeZone: member.zone })).getHours();

      // Determine time slot category and apply color coding
      let timeClass = 'bad-time';
      if (memberHours >= 9 && memberHours < 17) {
        timeClass = 'good-time'; // Good time from 9 AM to 5 PM
        goodCount++;
      } else if ((memberHours >= 7 && memberHours < 9) || (memberHours >= 17 && memberHours < 19)) {
        timeClass = 'ok-time'; // Okay time from 7-9 AM and 5-7 PM
        okCount++;
      } else {
        badCount++;
      }

      return { name: member.name, location: member.location, time: memberLocalTime, timeClass };
    });

    // Sort selected members by local time
    selectedMembers.sort((a, b) => a.time.localeCompare(b.time));

    // Display each team member's availability with location in styled boxes
    selectedMembers.forEach(member => {
      const listItem = document.createElement('div'); // Styled box format for each result
      listItem.className = `${member.timeClass} result-box`;
      listItem.textContent = `${member.name} (${member.location}): ${member.time}`;
      results.appendChild(listItem);
    });

    // Update the summary counts
    document.getElementById('goodCount').textContent = goodCount;
    document.getElementById('okCount').textContent = okCount;
    document.getElementById('badCount').textContent = badCount;
  }

  // Initialize all team members checked by default
  teamMembers.forEach((member, index) => {
    document.getElementById(`member-${index}`).checked = true;
  });
});
