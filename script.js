/* Scam or Slay? Quiz logic.
   All messages, names and links below are fictional (".example" domains can't be real). */

/* In each message, text wrapped in [[double brackets]] is a clue.
   Clues are highlighted only AFTER the player answers. */
const scenarios = [
  {
    channel: "Instagram DM", sender: "@quick.cash.jobs", answer: "scam",
    text: "Hey! We're hiring students for remote work. [[Earn $250 a day]] from your phone, [[no experience needed]].\n\nTo lock in your spot, [[send a $30 starter-kit fee]] with a gift card today.",
    explanation: "Real employers pay you; they don't ask you to pay them. Big money for no skills is classic bait.",
    clues: ["Unrealistic pay for no experience.", "You're asked to pay money to get a job.", "Gift cards are hard to trace, so scammers love them."]
  },
  {
    channel: "Email", sender: "library@riverside-uni.example", answer: "safe",
    text: "Hi Sam, your book \"Intro to Biology\" is due this Friday. You can renew it [[through the library app or website you already use]]. [[We will never ask for your password by email.]]",
    explanation: "It's calm, expected and useful. It doesn't push a link or ask for anything private.",
    clues: ["It's about something you actually borrowed.", "No link, no payment, no pressure.", "It sends you to the site you normally use."]
  },
  {
    channel: "Text message", sender: "Unknown number", answer: "scam",
    text: "PARCEL ALERT: Your delivery is on hold. [[Pay a $1.99 fee within 2 hours]] or it will be returned: [[parcel-redeliver.example/pay]]",
    explanation: "This is a classic delivery scam. The tiny fee is a way to get your card details.",
    clues: ["No company name or order number.", "A short deadline to make you rush.", "An odd link that isn't from a delivery company you know."]
  },
  {
    channel: "WhatsApp", sender: "\"Mum\" (new number)", answer: "scam",
    text: "Hi, it's Mum. [[I dropped my phone in the sink, this is my new number.]] Can you [[send $200 to my friend's account]] for me? [[Please don't call, my phone is broken.]] I'll explain later!",
    explanation: "Scammers pretend to be family. Stop and check using the number you already have for that person.",
    clues: ["A new number you haven't verified.", "A request for money.", "They discourage a phone call, because a call would expose them."]
  },
  {
    channel: "Group chat", sender: "Maya (chess club captain)", answer: "safe",
    text: "Reminder: chess club meets [[Thursday at 4pm in Room B12]] as usual. Bring a board if you have one. [[No sign-up needed.]]",
    explanation: "Someone you know is sharing a routine update. Nothing is being asked of you except to turn up.",
    clues: ["Known sender in a group you joined.", "Matches the club's usual plans.", "No links, money or personal details requested."]
  },
  {
    channel: "Email", sender: "Account Security <support@snapgram-help.example>", answer: "scam",
    text: "Your account will be [[deleted in 24 hours]] unless you verify. [[Click here to confirm your login]]: [[snapgram-help.example/verify]]\n\n[[Reply with your password]] to speed things up.",
    explanation: "Real platforms never ask for your password in a message. Fear of losing your account is the hook.",
    clues: ["Urgent threat to delete your account.", "Asks for your password.", "The link and sender don't match the app's real website."]
  },
  {
    channel: "Social media post", sender: "HealthHacks Daily (unverified page)", answer: "scam",
    text: "[[BREAKING:]] Scientists [[don't want you to know]] that lemon water [[cures every illness]]! [[Share with 10 friends]] before this gets deleted!",
    explanation: "This is misleading information. It has no real source and is designed to be shared, not checked.",
    clues: ["No named study or expert.", "Huge claims like \"cures every illness\".", "Pressure to share quickly."]
  },
  {
    channel: "Email", sender: "careers@brightfield-labs.example", answer: "safe",
    text: "Hi Alex, thanks for applying for the Marketing Intern role. We'd like to invite you to a video interview on Tuesday at 10am. [[Full details are in your applicant portal, so log in the way you did when you applied.]] [[There is no fee at any stage.]]",
    explanation: "It matches an application you made and it points you back to the portal you already used. No money is involved.",
    clues: ["You really applied for this role.", "No payment or sensitive details requested.", "Sends you to the official portal, not a mystery link."]
  },
  {
    channel: "Online ad", sender: "WinBig Prizes", answer: "scam",
    text: "[[Congratulations!]] You were [[randomly picked]] to win a brand-new phone! Pay [[$5 shipping]] and [[enter your card details and PIN]] at phone-prize.example in the next [[10 minutes]].",
    explanation: "You can't win a contest you never entered. The \"shipping fee\" is how they get your card and PIN.",
    clues: ["A prize from a contest you didn't enter.", "Asks for card details and a PIN.", "A countdown to stop you thinking it through."]
  },
  {
    channel: "Bank app notification", sender: "Northside Bank", answer: "safe",
    text: "A new device signed in to your account today. [[If this was you, no action is needed.]] If it wasn't, [[open the official app yourself or call the number on the back of your card.]] [[We will never ask for your PIN or password.]]",
    explanation: "It informs you and sends you to official channels you open yourself. It doesn't include a link or ask for secrets.",
    clues: ["Arrives inside the official app.", "Tells you to contact the bank on your own.", "Clearly says it won't ask for your PIN or password."]
  }
];

const tips = [
  { lead: "Pause before you click.", text: "Scams rely on speed. Take a breath and ask who is really sending this." },
  { lead: "Never share passwords, PINs or codes.", text: "Genuine companies and schools won't ask for them in a message." },
  { lead: "Don't pay to get a job or prize.", text: "Real jobs pay you. Real prizes don't need a \"fee\"." },
  { lead: "Check through another route.", text: "Open the official app or website yourself, or call a number you already trust." },
  { lead: "Verify money requests.", text: "If a friend or family member asks for money, call them on their usual number first." },
  { lead: "Check before you share.", text: "Look for a named source and see if trusted outlets report the same thing." },
  { lead: "Use strong, different passwords and turn on 2-step login.", text: "It protects you even if one account is hacked." },
  { lead: "Tell someone.", text: "Report and block scam messages, and tell a teacher, parent or friend if you get caught out. It happens to everyone." }
];

/* ---------- State ---------- */
let queue = [];        // shuffled questions for this round
let current = 0;       // index of the current question
let score = 0;
let answered = false;  // stops a question from being scored twice

const $ = (id) => document.getElementById(id);

/* Shows one screen (home, quiz or results) and hides the others. */
function showScreen(name) {
  ["home", "quiz", "results"].forEach((id) => { $(id).hidden = id !== name; });
}

/* Returns a shuffled copy of an array (Fisher-Yates). */
function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Resets everything and begins a new round. Used by Start and Play again. */
function startQuiz() {
  queue = shuffle(scenarios);
  current = 0;
  score = 0;
  $("score").textContent = "0";
  showScreen("quiz");
  loadQuestion();
}

/* Builds the message text. Pieces inside [[...]] become <span class="clue">.
   Uses textContent, so message text is never treated as HTML. */
function renderMessage(text) {
  const box = $("message-text");
  box.textContent = "";
  text.split(/\[\[(.+?)\]\]/).forEach((part, i) => {
    const span = document.createElement("span");
    if (i % 2 === 1) span.className = "clue"; // odd pieces are clues
    span.textContent = part;
    box.appendChild(span);
  });
}

/* Shows the current question and resets the answer controls. */
function loadQuestion() {
  const q = queue[current];
  answered = false;

  $("progress-text").textContent = `Message ${current + 1} of ${queue.length}`;
  const bar = $("progress");
  bar.setAttribute("aria-valuemax", queue.length);
  bar.setAttribute("aria-valuenow", current + 1);
  $("bar-fill").style.width = `${((current + 1) / queue.length) * 100}%`;

  $("channel").textContent = q.channel;
  $("sender").textContent = q.sender;
  renderMessage(q.text);
  $("message").className = "message";

  // Reset radio buttons and labels
  document.querySelectorAll('input[name="choice"]').forEach((radio) => {
    radio.checked = false;
    radio.disabled = false;
  });
  document.querySelectorAll(".choice").forEach((label) => label.classList.remove("correct"));

  $("submit-btn").disabled = true;
  $("answer-form").hidden = false;
  $("feedback").hidden = true;
  $("next-btn").hidden = true;

  $("progress-text").focus(); // helps keyboard and screen reader users
}

/* Checks the chosen answer, updates the score and shows feedback. */
function checkAnswer(event) {
  event.preventDefault();
  if (answered) return;

  const picked = document.querySelector('input[name="choice"]:checked');
  if (!picked) return;

  answered = true;
  const q = queue[current];
  const isCorrect = picked.value === q.answer;
  if (isCorrect) score++;
  $("score").textContent = score;

  // Lock the choices and mark the right answer
  document.querySelectorAll('input[name="choice"]').forEach((radio) => { radio.disabled = true; });
  document.querySelector(`label[for="choice-${q.answer}"]`).classList.add("correct");

  // Reveal the clues inside the message
  $("message").classList.add("revealed", `is-${q.answer}`);

  showFeedback(q, isCorrect);

  $("submit-btn").disabled = true;
  $("next-btn").textContent = current === queue.length - 1 ? "See my results" : "Next message";
  $("next-btn").hidden = false;
}

/* Fills in and shows the feedback box with the explanation and clue list. */
function showFeedback(q, isCorrect) {
  const kind = q.answer === "scam" ? "a scam" : "safe";
  const box = $("feedback");
  box.className = `feedback ${isCorrect ? "right" : "wrong"}`;
  $("feedback-title").textContent = isCorrect ? `Correct! This one is ${kind}.` : `Not quite. This one is ${kind}.`;
  $("feedback-text").textContent = q.explanation;

  const list = $("clue-list");
  list.textContent = "";
  q.clues.forEach((clue) => {
    const li = document.createElement("li");
    li.textContent = clue;
    list.appendChild(li);
  });

  box.hidden = false;
  box.focus(); // moves keyboard focus so screen readers read the feedback
}

/* Moves to the next question, or to the results after the last one. */
function nextQuestion() {
  current++;
  if (current < queue.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

/* Displays the final score, a rank message and the safety tips. */
function showResults() {
  const total = queue.length;
  const ratio = score / total;
  let rank, message;

  if (ratio >= 0.9) {
    rank = "Scam-proof";
    message = "Brilliant! You spotted almost everything. Share what you know with friends.";
  } else if (ratio >= 0.7) {
    rank = "Sharp eyes";
    message = "Great job. You caught most of the tricks. Review the tips below to close the gaps.";
  } else if (ratio >= 0.4) {
    rank = "Getting there";
    message = "Good start. Scammers are clever, and every round makes you harder to fool.";
  } else {
    rank = "Fresh start";
    message = "Don't worry, that's what practice is for. Read the tips and try again.";
  }

  $("final-score").textContent = score;
  $("final-total").textContent = total;
  $("rank").textContent = rank;
  $("rank-text").textContent = message;

  const list = $("tips");
  list.textContent = "";
  tips.forEach((tip) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = tip.lead + " ";
    li.appendChild(strong);
    li.appendChild(document.createTextNode(tip.text));
    list.appendChild(li);
  });

  showScreen("results");
  $("results-title").focus();
}

/* ---------- Event listeners ---------- */
$("start-btn").addEventListener("click", startQuiz);
$("restart-btn").addEventListener("click", startQuiz);
$("answer-form").addEventListener("submit", checkAnswer);
$("next-btn").addEventListener("click", nextQuestion);

// Enable the Submit button once the player picks Scam or Safe
document.querySelectorAll('input[name="choice"]').forEach((radio) => {
  radio.addEventListener("change", () => { $("submit-btn").disabled = answered; });
});
