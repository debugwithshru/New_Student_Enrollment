document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enrollmentForm');
    const enrollmentDateInput = document.getElementById('enrollment_date');
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
            const first_name = getVal('first_name');
            const last_name = getVal('last_name');
            const grade = getRadio('grade');
            const branch = getRadio('branch');
            const school_name = getVal('school_name');
            
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
            const enrollment_date = getVal('enrollment_date');
            const combo_package = getRadio('combo_package');

            // Build Params for n8n
            const params = new URLSearchParams();
            params.append('first_name', first_name);
            params.append('last_name', last_name);
            params.append('grade', grade);
            params.append('branch', branch);
            params.append('school_name', school_name);
            params.append('subjects_opted', selectedSubjects.join(', '));
            
            params.append('primary_contact_name', primary_name);
            params.append('primary_contact_phone', primary_number);
            params.append('primary_contact_relation', primary_relation);
            params.append('primary_language', primary_language);
            
            params.append('secondary_contact_name', secondary_name);
            params.append('secondary_contact_phone', secondary_number);
            params.append('secondary_contact_relation', secondary_relation);
            params.append('secondary_language', secondary_language);
            
            params.append('enrollment_status', enrollment_status);
            params.append('enrollment_date', enrollment_date);
            params.append('combo_package', combo_package);
            params.append('submission_date', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

            const finalUrl = `${WEBHOOK_URL}?${params.toString()}`;
            console.log('Submitting to:', finalUrl);

            fetch(finalUrl, { method: 'GET', mode: 'no-cors' })
            .then(() => {
                console.log('Successfully sent to n8n');
                
                // Success feedback on button
                const btn = document.getElementById('submitBtn');
                const oldText = btn.textContent;
                btn.textContent = 'Redirecting to Fees...';
                btn.style.background = '#00b894';

                // Automatically Redirect after 3.5 seconds to open Fee form in the same window
                setTimeout(() => {
                    const feeUrl = `https://student-fee-management.vercel.app/index.html?STUDENT_NAME=${first_name}%20${last_name}&GRADE=${grade}&BRANCH=${branch}`;
                    window.location.href = feeUrl;
                }, 3500); 
            })
            .catch(error => {
                console.error('Error sending to n8n:', error);
                alert('Connection error. Please try again.');
            });

            // Show 'FORM SUBMITTED' Overlay
            const successOverlay = document.getElementById('successOverlay');
            successOverlay.classList.add('active');

        } catch (err) {
            console.error('Submission Error:', err);
            alert('Error submitting form. Check console.');
        }
    });
});
