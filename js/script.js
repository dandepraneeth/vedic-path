let currentLanguage = "te";

const signs = [
  { icon:"♈", te:"మేషం", en:"aries", hi:"मेष" },
  { icon:"♉", te:"వృషభం", en:"taurus", hi:"वृषभ" },
  { icon:"♊", te:"మిథునం", en:"gemini", hi:"मिथुन" },
  { icon:"♋", te:"కర్కాటకం", en:"cancer", hi:"कर्क" },
  { icon:"♌", te:"సింహం", en:"leo", hi:"सिंह" },
  { icon:"♍", te:"కన్య", en:"virgo", hi:"कन्या" },
  { icon:"♎", te:"తుల", en:"libra", hi:"तुला" },
  { icon:"♏", te:"వృశ్చికం", en:"scorpio", hi:"वृश्चिक" },
  { icon:"♐", te:"ధనుస్సు", en:"sagittarius", hi:"धनु" },
  { icon:"♑", te:"మకరం", en:"capricorn", hi:"मकर" },
  { icon:"♒", te:"కుంభం", en:"aquarius", hi:"कुंभ" },
  { icon:"♓", te:"మీనం", en:"pisces", hi:"मीन" }
];

async function changeLanguage(lang){
  currentLanguage = lang;
  
  // Try loading your local JSON file if it exists
  try {
    const response = await fetch(`data/${lang}.json`);
    if(response.ok) {
      const data = await response.json();
      if(data.heroTitle) document.getElementById("heroTitle").innerText = data.heroTitle;
      if(data.heroText) document.getElementById("heroText").innerText = data.heroText;
      if(data.horoscopeHeading) document.getElementById("horoscopeHeading").innerText = data.horoscopeHeading;
    }
  } catch(e) {
    console.log("Local language JSON mapping file omitted or unreachable. Proceeding to refresh layouts...");
  }
  
  renderSigns();
}

function renderSigns(){
  const grid = document.getElementById("horoscopeGrid");
  if(!grid) return;
  grid.innerHTML = "";
  
  signs.forEach(sign => {
    let displayName = sign.te;
    if(currentLanguage === "en"){
      displayName = sign.en.toUpperCase();
    } else if(currentLanguage === "hi"){
      displayName = sign.hi;
    }
    
    grid.innerHTML += `
      <div class="horoscope-card" onclick="openHoroscopeDialog('${sign.en}', '${displayName}')">
        <div class="sign-icon">${sign.icon}</div>
        <h3 class="text-xl font-bold text-orange-950">${displayName}</h3>
      </div>
    `;
  });
}

async function openHoroscopeDialog(sign, name) {
  document.getElementById("modalTitle").innerText = name;
  document.getElementById("modalText").innerText = currentLanguage === "te" ? "సమాచారం లోడ్ అవుతోంది..." : (currentLanguage === "hi" ? "लोड हो रहा है..." : "Loading...");
  document.getElementById("horoscopeModal").style.display = "flex";
  
  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/horoscope?zodiac=${sign}`, {
      method: "GET",
      headers: { "X-Api-Key": "YOUR_API_KEY" } // Replace with your actual API key
    });
    
    const data = await response.json();
    let horoscopeText = data.horoscope || "No Horoscope Available";
    
    // If the active system context isn't English, pass through the translation engine
    if(currentLanguage !== "en") {
      try {
        const translateResponse = await fetch("https://translate.argosopentech.com/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: horoscopeText,
            source: "en",
            target: currentLanguage,
            format: "text"
          })
        });
        
        const translatedData = await translateResponse.json();
        if(translatedData && translatedData.translatedText) {
          horoscopeText = translatedData.translatedText;
        }
      } catch(error) {
        console.log("Translation service unreachable, falling back to English response text.");
      }
    }
    
    document.getElementById("modalText").innerText = horoscopeText;
  } catch (error) {
    document.getElementById("modalText").innerText = currentLanguage === "te" ? "కనెక్షన్ లోపం ఏర్పడింది" : "API Connection Error";
  }
}

function closeModal() {
  document.getElementById("horoscopeModal").style.display = "none";
}

// Ensure the signs run on immediate page load
document.addEventListener("DOMContentLoaded", () => {
  renderSigns();
});