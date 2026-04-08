document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enrollmentForm');
    const enrollmentDateInput = document.getElementById('enrollment_date');
    const schoolNameSelect = document.getElementById('school_name');
    const priorSchoolNameSelect = document.getElementById('prior_school_name');

    // School Name Synchronization
    schoolNameSelect.addEventListener('change', () => {
        priorSchoolNameSelect.value = schoolNameSelect.value;
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
    const WEBHOOK_URL = 'https://n8n.srv1498466.hstgr.cloud/webhook/f2e3f88d-e79d-4bd4-8dba-33966dde2bde'; 

    // Version Check
    console.log('Enrollment Script V2.7 - Modified UI');

    // Form Submission
    form.addEventListener('submit', async (e) => {
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
            const first_name = getVal('first_name');
            const last_name = getVal('last_name');
            const gender = getRadio('gender');
            const dobRaw = getVal('dob');
            const grade = getRadio('grade');
            const branch = getRadio('branch');
            const school_name = getVal('school_name');
            const prior_school_name = getVal('prior_school_name');
            const address = getVal('address');

            // Format DOB to dd-mm-yyyy
            let dob = '';
            if (dobRaw) {
                const [y, m, d] = dobRaw.split('-');
                dob = `${d}-${m}-${y}`;
            }

            // Hobbies logic
            const hobbies_val = getVal('hobbies');
            const hobbies = hobbies_val === 'Other' ? getVal('hobbies_other') : hobbies_val;
            
            // Subjects
            const selectedSubjects = Array.from(form.querySelectorAll('input[name="subjects"]:checked'))
                .map(cb => cb.value);
            
            if (selectedSubjects.length < 5) {
                alert('Rule: Minimum 5 subjects must be selected.');
                const grid = document.querySelector('.checkbox-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Primary Contact
            const primary_name = getVal('primary_name');
            const primary_number = getVal('primary_number');
            const primary_relation = getRadio('primary_relation');
            const primary_language = getVal('primary_language') === 'Other' ? getVal('primary_language_other') : getVal('primary_language');

            // Secondary Contact
            const secondary_name = getVal('secondary_name');
            const secondary_number = getVal('secondary_number');
            const secondary_relation = getRadio('secondary_relation');
            const secondary_language = getVal('secondary_language') === 'Other' ? getVal('secondary_language_other') : getVal('secondary_language');

            // Enrollment Details
            const enrollment_status = getRadio('enrollment_status');
            const enrollment_date_raw = getVal('enrollment_date');
            let enrollment_date = '';
            if (enrollment_date_raw) {
                const [y, m, d] = enrollment_date_raw.split('-');
                enrollment_date = `${d}-${m}-${y}`;
            }
            const combo_package = getRadio('combo_package');

            // Build Payload for n8n
            const payload = {
                first_name,
                last_name,
                gender,
                dob,
                hobbies: hobbies || '',
                grade,
                branch,
                school_name,
                prior_school_name,
                address,
                subjects_opted: selectedSubjects.join(', '),
                primary_contact_name: primary_name,
                primary_contact_phone: primary_number,
                primary_contact_relation: primary_relation,
                primary_language,
                secondary_contact_name: secondary_name,
                secondary_contact_phone: secondary_number,
                secondary_contact_relation: secondary_relation,
                secondary_language,
                enrollment_status,
                enrollment_date,
                combo_package,
                submission_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            console.log('Submitting Payload:', payload);

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok || response.status === 0) {
                console.log('Successfully submitted');
                
                // Show 'FORM SUBMITTED' Overlay
                const successOverlay = document.getElementById('successOverlay');
                successOverlay.classList.add('active');

                // Success feedback on button
                const btn = document.getElementById('submitBtn');
                btn.textContent = 'Redirecting to Fees...';
                btn.style.background = '#00b894';

                // Automatically Redirect after 3.5 seconds
                setTimeout(() => {
                    const feeUrl = `https://student-fee-management.vercel.app/index.html?STUDENT_NAME=${first_name}%20${last_name}&GRADE=${grade}&BRANCH=${branch}`;
                    window.location.href = feeUrl;
                }, 3500); 
            } else {
                throw new Error('Server responded with ' + response.status);
            }

        } catch (err) {
            console.error('Submission Error:', err);
            alert('Error submitting form. Check console.');
        }
    });
});
