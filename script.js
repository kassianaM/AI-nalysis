document.addEventListener('DOMContentLoaded', function() {
    // --- Global State & Elements ---
    const navStudent = document.getElementById('navStudent');
    const navInstitution = document.getElementById('navInstitution');
    const studentView = document.getElementById('studentView');
    const institutionalView = document.getElementById('institutionalView');
    const analyzerForm = document.getElementById('analyzerForm');
    const studentResult = document.getElementById('studentResult');
    
    // Goal Elements
    const goalSection = document.getElementById('goalSection');
    const goalTextEl = document.getElementById('goalText');
    const customGoalTextEl = document.getElementById('customGoalText');
    const goalDateEl = document.getElementById('goalDate');
    const saveGoalButton = document.getElementById('saveGoalButton');
    const clearGoalButton = document.getElementById('clearGoalButton');

    // Dashboard Elements
    const submissionCountEl = document.getElementById('submissionCount');
    const dashboardFilter = document.getElementById('dashboardFilter');
    const insightTextEl = document.getElementById('insightText');
    const policyBuilderForm = document.getElementById('policyBuilderForm');
    const policyOutput = document.getElementById('policyOutput');
    let adoptionChart, learnerProfileChart;

    // --- Real-Time Data Simulation ---
    let surveySubmissions = [
        { index: 8, type: 'Strategic User', discipline: 'STEM' }, { index: 12, type: 'Regular User', discipline: 'STEM' },
        { index: 35, type: 'Over-reliant Learner', discipline: 'STEM' }, { index: 28, type: 'Over-reliant Learner', discipline: 'Humanities' },
        { index: 7, type: 'Strategic User', discipline: 'Humanities' }, { index: 18, type: 'Regular User', discipline: 'Humanities' },
        { index: 15, type: 'Regular User', discipline: 'Business' }, { index: 22, type: 'Regular User', discipline: 'Business' },
    ];

    // --- Navigation Logic ---
    function showView(viewToShow) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        viewToShow.classList.add('active');
        if(viewToShow.id === 'studentView') {
            navStudent.classList.add('active');
        } else {
            navInstitution.classList.add('active');
        }
    }
    navStudent.addEventListener('click', () => showView(studentView));
    navInstitution.addEventListener('click', () => {
        showView(institutionalView);
        updateDashboard();
    });

    // --- Personal Analyzer Logic ---
    analyzerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const discipline = document.getElementById('disciplineSelect').value;
        const frequency = parseInt(document.getElementById('frequency').value);
        const taskCheckboxes = document.querySelectorAll('input[name="task"]:checked');
        let totalTaskComplexity = 0;
        taskCheckboxes.forEach(checkbox => totalTaskComplexity += parseInt(checkbox.value));
        if (totalTaskComplexity === 0) { alert("Please select at least one task."); return; }
        const dependencyIndex = frequency * totalTaskComplexity;
        let learnerType = '';
        if (dependencyIndex < 15) learnerType = "Strategic User";
        else if (dependencyIndex < 30) learnerType = "Regular User";
        else learnerType = "Over-reliant Learner";
        
        const peerComparisonHTML = calculatePeerComparison(dependencyIndex, discipline);

        studentResult.innerHTML = `
            <h3>Your AI Usage Profile</h3>
            <p><strong>Your Dependency Index Score:</strong> ${dependencyIndex}</p>
            <p><strong>Your Learner Profile:</strong> ${learnerType}</p>
            <div class="peer-comparison">${peerComparisonHTML}</div>`;
        studentResult.classList.remove('hidden');
        goalSection.classList.remove('hidden');

        surveySubmissions.push({ index: dependencyIndex, type: learnerType, discipline: discipline });
    });
    
    // --- Peer Comparison Logic ---
    function calculatePeerComparison(userIndex, userDiscipline) {
        const peers = surveySubmissions.filter(sub => sub.discipline === userDiscipline);
        if (peers.length === 0) return "You're the first from your discipline to submit!";
        const peerTotalIndex = peers.reduce((sum, peer) => sum + peer.index, 0);
        const peerAverage = (peerTotalIndex / peers.length).toFixed(1);
        let comparisonText = `The average Dependency Index for students in <strong>${userDiscipline}</strong> is <strong>${peerAverage}</strong>. `;
        if (userIndex > peerAverage * 1.2) comparisonText += "Your usage is significantly higher than your peers.";
        else if (userIndex < peerAverage * 0.8) comparisonText += "Your usage is lower than your peers.";
        else comparisonText += "Your usage is similar to your peers.";
        return comparisonText;
    }

    // --- Enhanced Goal Setting Logic ---
    saveGoalButton.addEventListener('click', () => {
        const goalText = customGoalTextEl.value;
        const goalDate = goalDateEl.value;
        if (!goalText || !goalDate) {
            alert("Please write your goal and select a date.");
            return;
        }
        localStorage.setItem('aiAnalysisGoal', JSON.stringify({ text: goalText, date: goalDate }));
        loadGoal();
        customGoalTextEl.value = '';
        goalDateEl.value = '';
    });

    clearGoalButton.addEventListener('click', () => {
        localStorage.removeItem('aiAnalysisGoal');
        loadGoal();
    });

    function loadGoal() {
        const savedGoal = localStorage.getItem('aiAnalysisGoal');
        if (savedGoal) {
            const { text, date } = JSON.parse(savedGoal);
            const goalDateObj = new Date(date + 'T00:00:00');
            const today = new Date();
            today.setHours(0,0,0,0);

            goalTextEl.innerHTML = `On <strong>${goalDateObj.toLocaleDateString()}</strong>, you plan to: <br><em>"${text}"</em>`;
            clearGoalButton.classList.remove('hidden');
            
            if (goalDateObj.getTime() === today.getTime()) {
                alert(`REMINDER: Today is the day for your goal!\n\nYour goal: "${text}"`);
            }
        } else {
            goalTextEl.textContent = "You have no active goal. Set one below!";
            clearGoalButton.classList.add('hidden');
        }
    }

    // --- Institutional Dashboard Logic ---
    dashboardFilter.addEventListener('change', updateDashboard);
    
    function updateDashboard() {
        const selectedDiscipline = dashboardFilter.value;
        const filteredData = selectedDiscipline === 'All'
            ? surveySubmissions
            : surveySubmissions.filter(sub => sub.discipline === selectedDiscipline);

        submissionCountEl.textContent = `${filteredData.length} submissions`;
        const profileCounts = { 'Strategic User': 0, 'Regular User': 0, 'Over-reliant Learner': 0 };
        const indexSums = { 'Strategic User': 0, 'Regular User': 0, 'Over-reliant Learner': 0 };
        filteredData.forEach(sub => { profileCounts[sub.type]++; indexSums[sub.type] += sub.index; });
        const avgIndex = {
            strategic: profileCounts['Strategic User'] > 0 ? (indexSums['Strategic User'] / profileCounts['Strategic User']).toFixed(1) : 0,
            regular: profileCounts['Regular User'] > 0 ? (indexSums['Regular User'] / profileCounts['Regular User']).toFixed(1) : 0,
            overReliant: profileCounts['Over-reliant Learner'] > 0 ? (indexSums['Over-reliant Learner'] / profileCounts['Over-reliant Learner']).toFixed(1) : 0,
        };
        learnerProfileChart.data.datasets[0].data = Object.values(profileCounts);
        adoptionChart.data.datasets[0].data = [avgIndex.strategic, avgIndex.regular, avgIndex.overReliant];
        learnerProfileChart.update();
        adoptionChart.update();
        generateInsight(filteredData, profileCounts, selectedDiscipline);
    }
    
    function generateInsight(data, counts, discipline) {
        if (data.length < 3) {
            insightTextEl.textContent = "More data is needed to generate a reliable insight for this filter.";
            return;
        }
        const total = data.length;
        const overReliantPercent = (counts['Over-reliant Learner'] / total) * 100;
        if (overReliantPercent > 40) {
            insightTextEl.innerHTML = `<strong>High Alert:</strong> A significant portion (${overReliantPercent.toFixed(0)}%) of students in the <strong>${discipline}</strong> category are 'Over-reliant Learners'. Intervention and policy review are recommended.`;
        } else if (counts['Strategic User'] > counts['Regular User']) {
            insightTextEl.innerHTML = `<strong>Positive Trend:</strong> A majority of students in <strong>${discipline}</strong> are 'Strategic Users', indicating healthy and effective AI adoption. This group could serve as mentors.`;
        } else {
            const highestAvg = Math.max(...adoptionChart.data.datasets[0].data);
            const highestProfile = adoptionChart.data.labels[adoptionChart.data.datasets[0].data.indexOf(highestAvg)];
            insightTextEl.innerHTML = `<strong>Observation:</strong> The '<strong>${highestProfile}</strong>' profile has the highest average Dependency Index. Efforts could be focused on providing targeted guidance to this group within the <strong>${discipline}</strong> discipline.`;
        }
    }

    policyBuilderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const discipline = document.getElementById('policyDiscipline').value;
        const strictness = document.getElementById('strictness').value;
        let policyText = `**AI Usage Policy for ${discipline}**\n\n`;
        if (strictness === 'Permissive') policyText += "Students are encouraged to use AI tools for brainstorming, drafting, and revision. Full disclosure of tools used is required in an appendix.";
        else if (strictness === 'Balanced') policyText += "AI tools may be used for brainstorming, research summarization, and grammar checks. AI-generated text may not be submitted as original work. Students must be able to explain the entire process of their work.";
        else policyText += "The use of generative AI for creating any part of a submitted assignment is prohibited and will be treated as academic dishonesty. AI may only be used for basic proofreading after the work is complete.";
        policyOutput.querySelector('pre').textContent = policyText;
        policyOutput.classList.remove('hidden');
    });

    function initializeCharts() {
        const chart1Ctx = document.getElementById('chart1').getContext('2d');
        learnerProfileChart = new Chart(chart1Ctx, { type: 'doughnut', data: { labels: ['Strategic Users', 'Regular Users', 'Over-reliant Learners'], datasets: [{ data: [], backgroundColor: ['#2c3e50', '#3498db', '#a9cce3'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } } });
        const chart2Ctx = document.getElementById('chart2').getContext('2d');
        adoptionChart = new Chart(chart2Ctx, { type: 'bar', data: { labels: ['Strategic', 'Regular', 'Over-reliant'], datasets: [{ label: 'Average Dependency Index', data: [], backgroundColor: 'rgba(52, 152, 219, 0.7)' }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } } });
    }
    
    // --- Initial Setup ---
    function initialize() {
        initializeCharts();
        loadGoal();
        updateDashboard();
        showView(studentView);
    }
    
    initialize();
});