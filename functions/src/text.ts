/* eslint-disable max-len */
export const groupName = 'PCT 1 (AILURUS)';

export const notInGroup = `You are not part of ${groupName}, but you can still use the public commands.`;

export const greeting = (): string => {
  const greet =
`Hello there! I am your friendly Red Panda serving you
all the bamboos you need! Type /help to see this again.
Type /commands to see the list of commands. Note that
on phone, you can long press the commands to add 
your message to it. `;
  return greet;
};

export const bus = {
  text: 'Check out the latest bus routes!',
  link: 'https://nusbuses.com/',
  ios: 'https://apps.apple.com/sg/app/nus-nextbus/id542131822',
  android: 'https://play.google.com/store/apps/details?id=nus.ais.mobile.android.shuttlebus',
};

export const morningTemperature =
`Good Morning! Red Panda is reminding 
you to submit your temperature declaration! ^.^`;

export const afternoonTemperature =
`Good Afternoon! Red Panda is reminding
you to submit your temperature declaration! ^.^`;

export const hotlines =
`<b>These are important hotlines to take note of:</b>

<b>PCT 1 Resident Assistant (RA)</b>: +6565164001
<b>PGPR Management Office</b> (MO) (9-6pm): 66011111
<b>Fire Command Center</b> (FCC) (24hrs): 66012222
<b>Campus Security</b> (24hrs): 68741616
<b>OHS Hotline</b> (urgent maintenance): 65161212
<b>Laundry room issues</b>: 97250566
<b>ITcare</b>: 65162080`;

export const pgphandbook = 'You can use the PGP handbook to find out how to mail to PGP and facilities here, and more!';
export const pgphandbookLink = 'https://nus.edu.sg/osa/docs/default-source/osa-doc/resources-and-policies/nus-pgpr-handbook.pdf';

export const issues = {
  emergency:
`<b>PCT 1 Resident Assistant (RA): +6565164001</b>

<b>Medical Emergencies (in PGP)</b>
- Office Hour: PM / RA / House Manager
- After Office Hour: PM / RA / RF
- If ambulance needed, call FCC 66012222 and inform PM/RA/RF/House Manager <b>immediately</b>
- Singapore Ambulance Emergency: 995
- Singapore Ambulance Non-Emergency: 1777
      
<b>Police Emergency</b>
- Singapore Police Emergency: 999
- Singapore Police SMS Emergency: 71999
- Singapore Police Hotline: 18002550000
      
<b>Psychological / Security Emergency</b>
- Lifeline NUS (psychological): 65167777
- Kent Ridge Security: 68741616
- Bukit Timah Campus: 65163636
- Outram Campus: 62225568`,
  counsellingLink: 'https://www.nus.edu.sg/uhc/mental-health/student',
  rules:
`<b>Housing Rules Violation</b>
- Report to PM -> RA
- If safety/security is of concern, call FCC 66012222 <u>immediately</u>`,
  demeritLink: 'https://nus.edu.sg/osa/docs/default-source/osa-doc/services/hostel-admission/housing-agreement/demerit_point_structure.pdf?sfvrsn=ae8749a2_2',
  maintenance:
`<b>Maintenance Issues (in cluster)</b>
- <u>Urgent Maintenance</u> (pipe burst, black out): OHS Hotline 65161212 (option 1)
- <u>Non-Urgent Housekeeping or Maintenance</u>:
(e.g. lights blow, toilet choked etc.)
<b>UHMS > Room Maintenance > New Job</b>`,
  uhmsLink: 'https://uhms.nus.edu.sg/StudentPortal/6B6F7C08/8/238/Home-Home_',
  residential:
`<b>Residential issues</b>
- <u>Conflict with other resident</u>: report to PM
- <u>Missing item(s)</u>: PM -> Mr Boon Yeow
  --> details of missing items, suspected time, location
- <u>Lock-out / mobile key</u>: 
  --> Office hours (9 - 6PM): PGPR Management Office 66011111
  --> After office hours: FCC 66012222
  --> No admin fee imposed for the first 2 weeks of the semester and for first time lock-out
  --> For second and subsequent requests: 
        During office hours: $5.00 per lockout
        After office hours: $10.00 per lockout
  --> Replacement of access card: $25.00
- <u>Laundry room issues</u>: 97250566
- <u>Suspicious / Unusual behaviour</u>: PM / RA (report immediately)
- <u>Any other issues</u>: report to PM`,
};

/* Commands
start - - Start the bot with greeting message.
help - -> Show greeting message.
commands - -> Show list of commands
bus - -> NUS Bus routes and info.
reminder - -> set temperature declaration reminders
pgphandbook - -> Show PGP Handbook.
hotline - -> important contacts and hotlines
emergency - -> important emergency information and contacts
bday - <DD/MM/YYYY> -> (Members only) Set birthday date to <DD/MM/YYYY>.
*/

export const publicCmds =
`<b>General</b>
/start - <code>Start the bot with greeting message.</code>
/help - <code>Show greeting message.</code>
/commands - <code>Show commands.</code>
/roll - <code>Roll dice.</code>
/rand &lt;min(optional)&gt; &lt;max&gt; - <code>Choose a random number between min and max. Default min is 0.</code>
/pic - <code>Send a picture of Red Panda!</code>
/fact - <code>Send a fact of Red Panda!</code>
/joke - <code>Send a joke!</code>
/8ball &lt;question&gt; - <code>Reply to your yes or no question.</code>

<b>NUS</b>
/bus - <code>NUS Bus routes and info.</code>
/reminder - <code>Set temperature declaration reminders.</code>

<b>PGP House</b>
/pgphandbook - <code>Show PGP Handbook.</code>
/hotline - <code>Important contacts and hotlines.</code>
/emergency - <code>Important emergency information and contacts</code>
/rules - <code>Housing rules and Demerit Point Structure</code>
/maintenance - <code>Maintenance issues procedures</code>
/others - <code>Other residential issues procedures</code>
/dyom - <code>Design your own module information</code>
`;

export const memberCmds =
`<b>Member Commands</b>
/info @username - <code>(Members only) Get information of username</code>
/bday &lt;DD/MM/YYYY&gt; - <code>(Members only) Set birthday date to &lt;DD/MM/YYYY&gt;.</code>
/bdaymonth &lt;month&gt; - <code>(Members only) Show all birthdays for a specific month.</code>
/anonmsg &lt;message&gt; - <code>(Members only)(private message only) Send an anonymous message to the Peer Mentors</code>
`;

export const adminCmds =
`<b>Admin Commands</b>
/m &lt;message&gt; - <code>(Admins only) Send message to members chat as Red Panda</code>
/reply &lt;message&gt; - <code>(Admins only) Reply to anonymous message</code>
/cancel - <code>(Admins only) Cancel reply to anonymous message</code>
`;

export const superAdminCmds =
`<b>Superadmin Commands</b>
/superAdmin &lt;password&gt; - <code>Set messanger as superAdmin</code>
/setAdminRoom - <code>Set current chat as admin chat, and initialise all admins as admins</code>
/setMemberRoom - <code>Set current chat as member chat</code>
/setLogRoom - <code>Set current chat as log chat</code>
/send &lt;chatId&gt; &lt;message&gt; - <code>Send message to specific chat ID</code>
`;

export const redPandaFacts = [
  'Red pandas can be easily identified by their unique ruddy coat color, which acts like camouflage within the canopy of fir trees where branches are covered with clumps of reddish-brown moss and white lichens.',
  'Red pandas share the giant panda’s pseudo-thumb, a modified wrist bone used to grasp bamboo when feeding.',
  'Red pandas are the only living member of the Ailuridae family!',
  'Red panda\'s taxonomic position has long been a subject of scientific debate. They were first described as members of the raccoon family. Later, due to some agreements in DNA, they were assigned to the bear family. Most recent genetic research, however, places red pandas in their own, independent family: Ailuridae',
  'Adult red pandas typically weigh between 8 and 17 pounds (3.6 and 7.7 kilograms) and are 22 to 24.6 inches (56 to 62.5 centimeters) long, plus a tail of 14.6 to 18.6 inches (37 to 47.2 centimeters).',
  'Red pandas are roughly the size of a large domestic cat.',
  'The red panda is endemic to the temperate forests of the Himalayas, and ranges from the foothills of western Nepal to China in the east',
  'While originally thought to be two subspecies, new genetic studies suggest that there are two distinct species of red panda: Ailurus fulgens fulgens (Chinese) and Ailurus fulgens styani (Himalayan) (also known as Ailurus fulgens refulgens). The latter tends to be larger and deeper red in color than the former.',
  'Red pandas stand on their hind legs! While an upright panda may be cute, this is actually a defense mechanism as red pandas will often stand up to appear larger when provoked or threatened. They will also let out their loudest call: WAAH.',
  'Red pandas have a sweet tooth! They prefer artificial sugars to plain or naturally sweetened bowls of water.',
  'Red pandas have different names depending on where you are. In Nepal, they\'re called bhalu biralo. Sherpas call the critter ye niglva ponva or wah donka.',
  'In south-west China, red pandas are hunted for their fur, especially for the highly valued bushy tails, from which hats are produced. In these areas, the fur is often used for local cultural ceremonies. In weddings, the bridegroom traditionally carries the hide. The "good-luck charm" red panda-tail hats are also used by local newly-weds.',

];

export const noParam = 'Please <u>long press</u> the command followed by your message.';
export const replying = 'You are currently replying! Type /cancel to cancel!';
export const nextReply = '<u>Long press</u> /reply &lt;message&gt; to reply to the user with your message, /cancel to cancel replying';
export const noReply = 'You have no one to reply to!';

export const noBday = 'No birthday set. Type <code>/bday DD/MM/YYYY</code> to set your birthday date.';
export const invalidDate = 'Invalid date! Use DD/MM/YYYY';
export const invalidMonth = 'Invalid month! Use Jan/Feb/Mar etc.';
export const noPersonBday = 'No one has birthday on the month of: ';
