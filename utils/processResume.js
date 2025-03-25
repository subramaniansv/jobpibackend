const nlp = require('compromise');
  // Predefined skills database
  const skillsDB = [
    "JavaScript", "Python", "Java","cpp","c sharp", "Ruby", "Swift", "Kotlin", "PHP", "TypeScript",
    "React.js", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot",
    "HTML", "CSS", "SASS", "Bootstrap", "Tailwind CSS",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "GraphQL",
    "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "AWS", "Azure", "Google Cloud",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science",
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Matplotlib",
    "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Cryptography", "Blockchain",
    "Android Development", "iOS Development", "Flutter", "React Native", "SwiftUI",
    "Game Development", "Unity", "Unreal Engine", "Blender", "3D Modeling",
    "Electrical Engineering", "Embedded Systems", "IoT", "Arduino", "Raspberry Pi",
    "Mechanical Design", "AutoCAD", "SolidWorks", "ANSYS", "MATLAB",
    "Finance", "Investment Analysis", "Accounting", "Taxation", "Financial Modeling",
    "Marketing", "SEO", "Content Marketing", "Social Media Marketing", "Google Ads",
    "Sales", "Negotiation", "CRM", "Cold Calling", "Lead Generation",
    "Healthcare", "Nursing", "Medical Coding", "Pharmacy", "Clinical Research",
    "Teaching", "Curriculum Development", "Online Teaching", "Educational Technology",
    "Project Management", "Agile", "Scrum", "Kanban", "JIRA",
    "Copywriting", "Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "UI/UX Design",
    "Photography", "Video Editing", "Motion Graphics", "3D Animation", "After Effects",
    "Legal Research", "Contract Law", "Corporate Law", "Intellectual Property",
    "Human Resources", "Recruitment", "Employee Relations", "Payroll", "Training & Development",
    "Customer Service", "Call Center", "Help Desk", "Technical Support", "Soft Skills"
  ]

  // Extract contact information (Email, Phone, LinkedIn)
  const extractContact = (text) => {
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
      const phoneRegex = /\+?\d{10,15}/g;
      const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/(?:in|pub|profile|company)?\/[A-Za-z0-9_-]+/gi;
  
      return {
          email: text.match(emailRegex)?.[0] || "Email not found",
          phone: text.match(phoneRegex)?.[0] || "Phone not found",
          linkedin: text.match(linkedinRegex)?.[0] || "LinkedIn ID not found"
      };
  };
  
  // Extract work experience details
  const extractExp = (text) => {
      const doc = nlp(text);
      if (doc.has("student") || doc.has("fresher")) {
          return "Fresher";
      }
  
      // Improved regex-based extraction
      const expRegex = /(?:\d{1,2}\s*years?\s*of\s*experience|worked\s+at|internship\s+at)/gi;
      const match = text.match(expRegex);
  
      return match ? match.join(" ") : "Not Found";
  };
  
  // Extract education details
  const extractEdu = (text) => {
      const educationRegex = /(?:studied at|graduated from|completed.*at|degree in)?\s*([\w\s]+(?:college|university|institute|academy))/i;
      const match = text.match(educationRegex);
  
      return match ? match[1].trim() : "Not Found";
  };
  
  // Extract skills based on predefined skills database
  const extractSkills = (text) => {
      return skillsDB.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text)) || ["Skills not found"];
  };
  
  // Main function that connects all extractions
  const processResume = (text) => {
      return {    
          contact: extractContact(text),
          experience: extractExp(text),
          education: extractEdu(text),
          skills: extractSkills(text),
      };
  };
  
  module.exports = { processResume };