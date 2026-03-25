document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enrollmentForm');
    const enrollmentDateInput = document.getElementById('enrollment_date');
    const subjectsSelect = document.getElementById('subjectsSelect');
    const subjectsTrigger = subjectsSelect.querySelector('.multi-select-trigger');
    const subjectsOptions = subjectsSelect.querySelectorAll('input[name="subjects"]');

    // Set default enrollment date to today
    const today = new Date().toISOString().split('T')[0];
    enrollmentDateInput.value = today;

    // Multi-select dropdown logic
    subjectsTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        subjectsSelect.classList.toggle('active');
    });

    // Close multi-select when clicking outside
    document.addEventListener('click', (e) => {
        if (!subjectsSelect.contains(e.target)) {
            subjectsSelect.classList.remove('active');
        }
    });

    // Update trigger text for multi-select
    const updateSubjectsText = () => {
        const selected = Array.from(subjectsOptions)
            .filter(opt => opt.checked)
            .map(opt => opt.value);
        
        if (selected.length === 0) {
            subjectsTrigger.textContent = 'Select Subjects...';
            subjectsTrigger.style.color = '#636e72';
        } else if (selected.length <= 2) {
            subjectsTrigger.textContent = selected.join(', ');
            subjectsTrigger.style.color = '#2d3436';
        } else {
            subjectsTrigger.textContent = `${selected.length} Subjects Selected`;
            subjectsTrigger.style.color = '#2d3436';
        }
    };

    subjectsOptions.forEach(opt => {
        opt.addEventListener('change', updateSubjectsText);
    });

    // Toggle "Other" Language logic
    window.toggleOtherLanguage = (selectElement, otherInputId) => {
        const otherInput = document.getElementById(otherInputId);
        if (selectElement.value === 'Other') {
            otherInput.style.display = 'block';
            otherInput.required = true;
        } else {
            otherInput.style.display = 'none';
            otherInput.required = false;
        }
    };

    // Webhook Configuration - CHANGE THIS LINE FOR PRODUCTION
    const WEBHOOK_URL = 'https://n8n.srv1498466.hstgr.cloud/webhook-test/f2e3f88d-e79d-4bd4-8dba-33966dde2bde';

    // Version Check
    console.log('Enrollment Script V2.2 Loaded');

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form Submit Triggered');
        
        try {
            const formData = new FormData(form);
            const data = {};

            // Helper to get radio/check value
            const getVal = (name) => formData.get(name);
            const getRadio = (name) => {
                const el = form.querySelector(`input[name="${name}"]:checked`);
                return el ? el.value : null;
            };

            // Basic Info
            data.student_id = getVal('student_id');
            data.biometric_id = getVal('biometric_id');
            data.first_name = getVal('first_name');
            data.last_name = getVal('last_name');
            data.grade = getRadio('grade');
            data.branch = getRadio('branch');
            data.school_name = getVal('school_name');
            
            // Subjects (Multi)
            const selectedSubjects = Array.from(form.querySelectorAll('input[name="subjects"]:checked'))
                .map(cb => cb.value);
            
            if (selectedSubjects.length < 5) {
                alert('Rule: Minimum 5 subjects must be selected.');
                subjectsSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
                subjectsSelect.classList.add('active');
                return;
            }
            data.subjects_opted = selectedSubjects;

            // Contacts
            data.primary_contact = {
                name: getVal('primary_name'),
                number: getVal('primary_number'),
                relation: getRadio('primary_relation'),
                language: getVal('primary_language') === 'Other' ? getVal('primary_language_other') : getVal('primary_language')
            };

            data.secondary_contact = {
                name: getVal('secondary_name'),
                number: getVal('secondary_number'),
                relation: getRadio('secondary_relation'),
                language: getVal('secondary_language') === 'Other' ? getVal('secondary_language_other') : getVal('secondary_language')
            };

            // Enrollment & Fees
            data.enrollment_status = getRadio('enrollment_status');
            data.enrollment_date = getVal('enrollment_date');
            data.fee_detail = {
                amount_paid: getVal('fee_paid'),
                installments: getVal('installments'),
                payment_mode: getVal('payment_mode')
            };

            console.log('Final Data:', data);

            // Send Data to Webhook (n8n)
            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => console.log('n8n response:', response.status))
            .catch(error => console.error('n8n error:', error));

            // Show 'FORM SUBMITTED' Overlay
            const successOverlay = document.getElementById('successOverlay');
            successOverlay.classList.add('active');

            // Wait 2 seconds, then show JSON Modal
            setTimeout(() => {
                successOverlay.classList.remove('active');
                
                const modal = document.getElementById('jsonModal');
                const output = document.getElementById('jsonOutput');
                output.value = JSON.stringify(data, null, 4);
                modal.classList.add('active');
            }, 2000);

            // Success feedback on button
            const btn = document.getElementById('submitBtn');
            const oldText = btn.textContent;
            btn.textContent = 'Submitted!';
            btn.style.background = '#00b894';
            setTimeout(() => {
                btn.textContent = oldText;
                btn.style.background = '';
            }, 3000);

        } catch (err) {
            console.error('Submission Error:', err);
            alert('Error generating JSON. Check console.');
        }
    });

    // Modal & Copy Logic
    const jsonModal = document.getElementById('jsonModal');
    const closeBtn = document.querySelector('.close-btn');
    const copyBtn = document.getElementById('copyJson');
    const jsonOutput = document.getElementById('jsonOutput');

    closeBtn.onclick = () => jsonModal.classList.remove('active');
    window.onclick = (e) => { if (e.target == jsonModal) jsonModal.classList.remove('active'); };

    copyBtn.onclick = () => {
        jsonOutput.select();
        document.execCommand('copy');
        const oldStr = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#00b894';
        setTimeout(() => {
            copyBtn.textContent = oldStr;
            copyBtn.style.background = '';
        }, 2000);
    };
});
