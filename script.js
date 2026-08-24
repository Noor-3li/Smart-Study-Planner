// Add a new subject row
function addSubject() {

    const container = document.getElementById("subjectsContainer");

    const row = document.createElement("div");

    row.className = "subject-row";

    row.innerHTML = `
        <input
            type="text"
            class="subject-name"
            placeholder="Subject name"
        >

        <input
            type="date"
            class="exam-date"
        >

        <button
            type="button"
            class="remove-btn"
            onclick="removeSubject(this)"
        >
            ✕
        </button>
    `;

    container.appendChild(row);
}


// Remove a subject
function removeSubject(button) {

    const rows = document.querySelectorAll(".subject-row");

    // Don't allow removing the last row
    if (rows.length === 1) {
        alert("You need at least one subject.");
        return;
    }

    button.parentElement.remove();
}


// Calculate days between today and exam date
function getDaysLeft(examDate) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const exam = new Date(examDate);

    exam.setHours(0, 0, 0, 0);

    const difference = exam - today;

    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );
}


// Main calculation
function calculatePlan() {

    const studyHours = Number(
        document.getElementById("studyHours").value
    );

    if (!studyHours || studyHours <= 0) {
        alert("Please enter your available study hours per day.");
        return;
    }

    const names = document.querySelectorAll(".subject-name");
    const dates = document.querySelectorAll(".exam-date");

    let subjects = [];

    for (let i = 0; i < names.length; i++) {

        const name = names[i].value.trim();
        const date = dates[i].value;

        if (!name || !date) {
            alert("Please complete all subject fields.");
            return;
        }

        const daysLeft = getDaysLeft(date);

        if (daysLeft < 0) {
            alert(
                `"${name}" has an exam date in the past. Please select a future date.`
            );
            return;
        }

        subjects.push({
            name: name,
            date: date,
            daysLeft: daysLeft
        });
    }


    /*
        Calculate priority.

        The closer the exam is,
        the higher its priority.

        Example:

        2 days left  -> high priority
        10 days left -> medium priority
        30 days left -> lower priority

        We use:

        priority = 1 / (daysLeft + 1)
    */

    subjects.forEach(subject => {

        subject.priority =
            1 / (subject.daysLeft + 1);

    });


    // Calculate total priority
    let totalPriority = subjects.reduce(
        (total, subject) => total + subject.priority,
        0
    );


    // Calculate study hours for each subject
    subjects.forEach(subject => {

        subject.hours =
            (subject.priority / totalPriority) * studyHours;

        // Round to 2 decimal places
        subject.hours =
            Math.round(subject.hours * 100) / 100;

    });


    // Sort by exam date
    subjects.sort(
        (a, b) => a.daysLeft - b.daysLeft
    );


    displayPlan(subjects, studyHours);
}


// Display the study plan
function displayPlan(subjects, totalHours) {

    const results =
        document.getElementById("results");

    const table =
        document.getElementById("planTable");

    const summary =
        document.getElementById("planSummary");


    table.innerHTML = "";


    subjects.forEach(subject => {

        const row = document.createElement("tr");

        let daysText = "";

        if (subject.daysLeft === 0) {
            daysText = `<span class="warning">Today</span>`;
        }
        else if (subject.daysLeft === 1) {
            daysText = `<span class="warning">1 day</span>`;
        }
        else if (subject.daysLeft <= 3) {
            daysText =
                `<span class="warning">${subject.daysLeft} days</span>`;
        }
        else {
            daysText =
                `${subject.daysLeft} days`;
        }


        row.innerHTML = `
            <td>
                <strong>${subject.name}</strong>
            </td>

            <td>
                ${formatDate(subject.date)}
            </td>

            <td>
                ${daysText}
            </td>

            <td class="hours">
                ${subject.hours} hours
            </td>
        `;

        table.appendChild(row);

    });


    summary.innerHTML = `
        <strong>Daily Study Time:</strong>
        ${totalHours} hours

        <br>

        <strong>Subjects:</strong>
        ${subjects.length}

        <br>

        <span class="success">
            Your available study time has been distributed
            according to exam urgency.
        </span>
    `;


    results.style.display = "block";

    results.scrollIntoView({
        behavior: "smooth"
    });
}


// Format date nicely
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}