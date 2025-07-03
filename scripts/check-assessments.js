// Quick script to check assessment data in Firestore
// Run with: node scripts/check-assessments.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need your service account key)
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id-default-rtdb.firebaseio.com/'
});

const db = admin.firestore();

async function checkAssessments() {
  try {
    console.log('🔍 Checking Firestore assessments...\n');
    
    const assessmentsRef = db.collection('assessments');
    const snapshot = await assessmentsRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No assessments found in Firestore');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} assessments\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📄 Assessment ID: ${doc.id}`);
      console.log(`👤 User ID: ${data.userId}`);
      console.log(`📸 Photos: ${data.photos?.length || 0} uploaded`);
      console.log(`📝 Text Description: "${data.textDescription || 'None'}"`);
      console.log(`⏱️  Duration: "${data.symptomDuration || 'Not specified'}"`);
      console.log(`🧴 Products: "${data.productUsage || 'Not specified'}"`);
      console.log(`🔄 Recent Changes: "${data.recentChanges || 'Not specified'}"`);
      console.log(`📅 Created: ${data.createdAt}`);
      console.log(`🔄 Status: ${data.status}`);
      console.log('---\n');
    });
    
  } catch (error) {
    console.error('❌ Error checking assessments:', error);
  }
}

checkAssessments(); 