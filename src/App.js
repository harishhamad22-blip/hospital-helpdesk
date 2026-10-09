import { useState, useEffect, useMemo, useRef, Component, createContext, useContext } from 'react';
import * as XLSX from 'xlsx-js-style';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { createPortal } from 'react-dom';
import { db } from './firebase';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc, limit
} from 'firebase/firestore';
import chrclogo from '../src/chrclogo.png';
import hospitalImg1 from './hospital.webp';
import hospitalImg2 from './hospital2.webp';
import hospitalImg3 from './hospital3.webp';


// ╔══════════════════════════════════════════════════════════════╗
// ║   CHOITHRAM HOSPITAL & RESEARCH CENTRE                       ║
// ║   IDAR — Complaint & Request System — v4.0                   ║
// ╚══════════════════════════════════════════════════════════════╝

// ── WHATSAPP CONFIG ───────────────────────────────────────────
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_CODE';
const CALLMEBOT_PHONE = '';
const CALLMEBOT_API_KEY = '';

// ── DEPARTMENTS ───────────────────────────────────────────────
const DEPARTMENTS = [
  "Wing B 311 (Discharge Summary)", "Wing B 312", "Wing B 314", "Wing B 315", "Wing B 316 (General Ward)",
  "Wing B 317", "Wing B 318", "General/Semi Nursing Counter", "Nursing Counter", "Burn Unit", "Wing A Nursing Station",
  "HDU (307)", "306", "305", "Genral Ward (304)", "303", "302", "Procedure Room", "301", "Isolation Room (308)",
  "Doctor Duty Room", "310", "Colonoscopy (343)", "Day Care (342)", "341", "340", "Wing C Nursing Counter",
  "Doctor Duty Room (339)", "HDU", "CTG", "Labour Room", "Quality (254)", "Organ Transplant Unit (RTU)",
  "Wing F Nursing Counter", "Wing E Nursing Counter", "Nursing Office", "Store Room", "Super Delux Counter",
  "Transplant Bone Marrow", "ASW Nursing Counter", "ASW Ward", "OT Reception", "OT Counsling Room",
  "OT Technician Room", "OT Recovery", "Operation Theatre (OT-1)", "Operation Theatre (OT-2)",
  "Operation Theatre (OT-3)", "Operation Theatre (OT-4)", "Operation Theatre (OT-5)", "Operation Theatre (OT-6)",
  "Operation Theatre (OT-7)", "Operation Theatre (OT-8)", "Operation Theatre (OT-9)", "OT Store",
  "CCU Billing Counter", "CCU Main Ward Counter", "Cath Lab", "Cath Lab Counselling Room", "Doctor Lounge",
  "PICU", "NICU", "NICU Counter (Reception)", "Seminar Room", "ICU A Block", "ICU B Block", "ICU Counter",
  "Pathalogy", "Microscopy 1", "Microscopy 2", "IHC Frozen Room", "Histopathalogy", "Section Cutting",
  "PCR Room", "Master mix Room", "TB Room", "Ethics Committee", "Clinical Research", "Blood Bank",
  "Sample Collection", "CSSD", "IT Hardware", "IT Training", "IT Department", "Digital Marketing",
  "Endoscopy Counselling Room", "Endoscopy OT 1", "Endoscopy OT 2", "Endoscopy OT 3", "Endoscopy Billing Counter",
  "West Wing Recovery Room", "Dialysis Billing Counter", "Dialysis Unit", "Dialysis New Counter",
  "MRD", "Billing", "Revisit", "Corporate Department", "Xray", "Xray Reporting Room", "MRI Console",
  "Reporting Room (Old)", "Admission Counter", "Audit", "Front Counter",
  "OPD 1", "OPD 2", "OPD 3", "OPD 4", "OPD 5", "OPD 6", "OPD 7", "OPD 8", "OPD 9", "OPD 10",
  "OPD 11", "OPD 12", "OPD 12A", "OPD 14", "OPD 15", "OPD 16", "OPD 17", "OPD 18", "OPD 19", "OPD 20",
  "OPD 21", "OPD 22", "OPD 23", "OPD 24", "OPD 25", "OPD 26", "OPD 27", "OPD 28", "OPD 29", "OPD 30",
  "OPD 31", "OPD 32", "OPD 33", "OPD 34", "OPD 35", "OPD 36", "OPD 37", "OPD 38", "OPD 39", "OPD 40",
  "OPD 41", "OPD 42", "Enquiry", "Chairman's Office", "HR Department", "Canteen", "Physiotherapy",
  "Nuclear Medicine", "Sonography", "Security Office", "Project Office", "House Keeping", "Trust Office", "Library"
];

const USERNAMES_RAW = `sagar.pathak,deepak.shelke,sunil.chandiwal,deepali.holkar,shubham.jain,sumit.nandedkar,anil.lakhwani,priyesh.vishwakarma,dheeraj.baluchi,aadesh.kumar,samir.das,nitin.sharma,sweta.akundi,vikramaditya.singh,dipanjali.nath,lakshi.maurya,ajit.ranjan,piyush.ghagre,rani.bisht,ranjana.yadav,dharmishta.rajput,indresh.chandele,shobha.chamania,vinay.prajapat,rajpal.singh,arpit.sethiya,ashish.goyal,vidyut.jain,mayank.cardio,hemlata.bareniya,narsi.reddy,vishal.panwar,sahil.parashar,pushpendra.joshi,sudhanshu.agnihotri,pawan.thada,shikha.mandloi,sumit.laley,avijit.mitra,vishal.patidar,bharti.malviya,chanda.purohit,arjun.maru,harsh.jakhetia,dinesh.mishra,shraddha.namjoshi,manoj.manjhi,avinash.sharma,alka.jain,ashish.patidar,aakansha.kaushal,samuel.pappachan,sachin.yadav,deepika.rathore,jitendra.joshi,manisha.rode,tinkesh.khandare,pooja.patidar,anurag.mourya,kanhaiya.mehra,girish.mandloi,bhawna.bhagwat,jitendra.tamraka,kunal.adhyaru,lokendra.patel,shubham.upadhyay,roshi.lanjewar,bs.thakur,nishant.shrivastava,sumit.singh,amber.mittal,priyank.shah,mayank.gastro,anjali.sharma,c.chamania,neela.oza,sarla.budhwani,navjot.saluja,ritika.jindal,prashant.srivastava,mayank.gusain,sandeep.rathore,divyansh.jain,arpit.jain,rohini.aktari,shubhangi.rawat,ruby.sengar,savita.agashe,rahul.bohat,ajay.patidar,harish.hamad,mukesh.meena,ganesh.yadav,dinesh.kumawat,madhuri.sahu,ambuj.jain,jitendra.dayaramani,anil.chauhan,gourav.pawar,rahul.kuwal,nitin.saxena,ravi.sahu,ankit.sharma,anand.meena,sapna.shukla,swapnil.jorvekar,supraja.vasu,farheen.ali,maya.varma,vinay.dubey,savan.agrwal,komal.pancholi,amit.deora,kedar.choudhary,pratik.khillari,mohan.yadav,priyanka.tiwari,mayuresh.hinduja,neha.rai,j.s.kathpal,ankitt.solanki,aniket.panwar,aayushi.mandloi,dhanraj.panjwani,mayur.sonare,neha.verma,bharat.sharma,dushyant.motiani,satish.motiani,deepika.jain,anamika.bhand,nilima.bhide,khushi.sen,sandeep.bhargava,deepak.pandit,shyamal.pal,sandeep.shivde,mayank.rathod,ravindra.kumar,rahul.raghuwanshi,shruti.raghuvanshi,raja.thambulkar,itsupport,rohit.jhawar,pratika.thada,nitin.gupta,sailee.jambhekar,deepak.panwar,hemlata.sharma,rajkumar.sangwan,deepak.khetan,prakash.doodhiya,sayli.khandelwal,deepak.patel,harsh.patel,manjeet.shinde,pushkar.dravid,shishank.bhadouriya,vivek.ashokan,kartik.batham,kartik.joshi,chetan.asawara,rashmi.baghel,muskan.kushwah,rahul.vaskale,sonu.surawat,rajkumar.basantani,abha.soni,pooja.dole,ranjeet.kaur,divyanshi.chouhan,akash.dass,purnima.bhale,vibhooti.trivedi,dilesh.sangeliya,sarfraz.khan,sminesh.philip,shivani.panwar,abhik.sikdar,nitika.yadav,richa.agrawal,sameer.nivsarkar,shrikant.phatak,siddharthsingh.chauhan,abhishek.raghuvanshi,saraswati.pandey,chetan.parmar,shivani.jaiswal,anand.sanghi,ratan.sahajpal,supriya.choudhary,shailendra.patel,suresh.carleton,chhabra.sokhey,piyush.joshi,vikram.balwani,alok.kumar,jai.kriplani,neha.agrawal,minakshi.sharma,sushma.jhamad,rajesh.patidar,vikas.asati,ali.saify,ameya.rangnekar,arjun.wadhwani,manoj.dubey,anshul.jaiswal,jenisha.jain,prashant.agrawal,rashmi.shad,shivani.patel,pravesh.kanthed,mahendra.acharya,gaurav.gupta,pradeep.jain,rajendra.aanjne,suruchi.singh,kumashantanu.navlekar,praveen.agrawal,sunanda.samanta,drnaman,parul.baldi,saurabh.duggad,siddharth.saraf,aneeta.patel,sarita.bamniya,princy.nathen,kavita.jatav,chandani.makwana,sarja.khaped,pooja.nargis,megha.sharma,anita.solanki,asha.bandole,kavita.shah,sheetal.kharat,seema.rawat,sonal.chaudhary,santoshi.panika,vina.ovhal,anjali.pal,subhashini.patel,ankita.verma,aruna.bhabar,priyanka.prajapati,divyani.choure,sangeeta.rawat,harsha.nirmal,pooja.dawar,jyoti.shivhare,sitara.bano,priyanka.lohar,roshni.solanki,shraddna.panwar,nandani.chouhan,hemlata.choudhary,jyoti.khatarkar,kirti.yadav,teena.namdev,arti.mandloi,sapna.todarmal,paramjeet.verma,diksha.wadbude,renu.tatware,sayma.chouhan,satendra.singh,rahul.goyal,durgesh.chawda,durga.eske,sharmila.maurya,hinisha.rathod,shubham.tare,ankita.soliwal,jyotshna.songara,pooja.yadav,harsha.duchakke,abhay.patel,aniket.pradhan,anand.malviya,ayush.francis,babulal.godiya,balram.meena,seema.yadav,rahul.parmar,sachin.sharma,sheetal.patel,sonu.prajapat,subhash.shinde,suyash.sisodiya,isha.soni,kaveeta.sharma,kirti.ahire,laxmi.kushwah,mayuri.nagar,minakshi.mehta,monika.verma,aman.piplodiya,anmol.pathak,mayank.naik,pinky.verma,harpreet.kaur,pal.singh,neha.neema,prachi.rathore,pratibha.dewatwal,priyanka.gonker,ravi.bavniya,ruchika.gangrade,sonam.sonare,suraj.dwivedi,vinita.ingle,khushi.meena,sulochana.chandrawat,manisha.jat,yogita.jajme,priyanka.chaporkar,deepali.puranik,amrata.pal,shobha.sharma,barkha.bamaniya,praveena.umbarkar,sangeeta.pardeshi,prateek.jadhav,kumkum.jain,pooja.bahediya,ishika.kathoriya,smita.pandit,reena.bonde,jayshree.supekar,deepati.vishwkarma,pinku.soni,sanjay.patil,aayushi.shambhawani,shyam.malviya,sawan.dharwe,nitika.singh,roshni.kurmi,chhaya.kushwah,anand.wasle,revisit.counter,vipin.kashyap,pawan.meena,vijay.shikarwar,varsha.sharma,anita.sendhalkar,verma.monika,akash.yevale,hemant.meena,mercy.paulose,mohit.sharma,nanda.hemwani,nandini.ahire,navin.patidar,nikita.chouhan,nikita.kharche,padma.tiwari,pramod.raghuwanshi,subhash.sharma,leena.sahu,sagheer.ahmed,prakash.yadav,sangeeta.chouhan,manish.tripathi,matin.ahmed,rahul.muwel,pramod.tiwari,roopali.mourya,bharti.yadav,prachi.sahu,kushboo.kashwap,pramod.mithoriya,shubham.malviya,abhay.dhaigude,vinita.phapunkar,pradeep.dhansore,alka.malviya,divya.panchal,bane.singh,mohan.jat,kanchan.sharma,anita.sharma,vikash.chourasiya,sonu.jat,priya.chouhan,pallavi.chutel,devendra.dubey,divya.bhati,sushmita.sen,aditi.yadav,kavita.toplani,priyanka.joshi,ajay.parmar,twinkle.darwai,sheetal.jain,jaya.badke,akash.ramawat,priyanka.bhagat,pushpalata.gehlot,rahul.jain,raisa.khan,rajendra.lad,raju.pardeshi,rakesh.tomar,robin.bandod,sabiha.ahmed,samarth.solanki,sangeeta.kaushal,satish.phatak,shubham.yadav,shewta.chandorkar,sonali.tapkire,thankmony.nair,vikash.verma,vishaka.rajput,yashita.tanwar,amit.dhurve,rajeshwai.pandhran,sachin.sen,sonakshi.sabnani,sunil.karma,varsha.yadav,mukesh.sharma,snehal.vairagkar,abhinav.gupta,kanish.markam,rupali.pawar,vimal.kumar,mukesh.sonti,kuldeep.saini,rajesh.gurjar,rajesh.mourya,sp.jaiswal,pushkar.joshi,megha.gour,kritika.jain,bidhi.kushwaha,mahima.ochani,sonali.poorkar,rinta.vincent,chhaya.gevare,ramendra.thakur,antim.tegar,taniya.panwar,sanjeev.choudhary,nilesh.tailor,deepak.choudhary,seema.jamod,mamta.sharma,asma.mansuri,ravina.solanki,vandan.solanki,vandana.nilkanth,radha.dawar,maya.verma,raj.kumar,sachin.wagh,sheetal.birthare,anita.vigrodiya,kajal.rajput,rajesh.ingle,hansraj.chouhan,lk.mourya,deepak.shrivastav,shubham.sisodiya,aniket.oad,kedar.rathore,vinod.rathore,bhuwan.gite,rahul.khandekar,shivlal.kushwah,bharti.sain,palak.sharma,laxmi.khilwani,neelam.vishwakarma,anil.shimle,atharva.joglekar,garv.khaturiya,anushka.tiwari,pooja.muzalde,vijay.thakur,daya.galav,satish.uikey,bhoopendra.sharma,ajay.verma,saroj.vishawakarma,rinku.kirade,neetu.amre,priyanka.rawat,pooja.solanki,khushboo.patel,kiran.jamra,kavita.eskey,priya.sahu,papuni.nayak,monika.choudhary,yashooda.shah,lalita.kirade,rekha.verma,pooja.patel,vandana.vish,riya.savner,nimisha.joseph,akriti.patel,somini.thomas,harshita.swami,payal.sahani,chitra.lande,anita.jadhav,chetna.yadav,chavan.rajesh,verma.neha,kanungo.sheel,jitendra.singh,kumkum.katarya,kirti.patel,monika.randa,sonali.vishwakarma,radheshyam.barsker,anil.panwar,ajay.tagore,panwar.anil,rincy.chacko,aagnes.francis,kavita.dangi,neha.chourase,akansha.ninama,anita.chouhan,chhaya.chouhan,aleen.vira,aakanksha.dhurve,rajendra.vishwkarma,priyanka.parashar,shubham.gehlot,priya.patil,rani.nagar,monika.jain,priyanka.jat,miti.jain,kanika.panchal,upma.rathore,sophia.stephon,riya.das,neha.yadav,vijaylaxmi.nair,blessy.john,kabita.laishram,aushi.raikwar,kirti.tiwari,rachana.ruhela,sakshi.sohani,nisha.patidar,karuna.singad,bharti.gandhare,kiran.rathore,divya.sahu,kavita.patil,satish.dohre,karishma.yadav,reena.bhuriya,shalom.maseeh,rameela.mujalde,nuri.barde,chanda.solanki,pooja.gujre,vandna.dawar,chhaya.gurjar,anju.chandran,roshan.mourya,vipin.patel,sanjay.soni,sunil.singh,jaya.barfa,pankaj.chouhan,vaishali.rathore,priya.yadav,pradeep.mansore,mvr,pravin.soni,ritu.sikligar,naresh.bharti,sarthak.shrivastava,manshi.bijore,ravi.nagar,pradeep.gupta,asw1,dranilkumar,burnunit,cathlab,xray,deluxeward,dialysis,drpraveen,endoscopy,entopd,cicu,femaleward,maleward,neuro,nsw1,gynward,otchrc,paedicu,painopd,pvtward,rad11,rad1.dept,itdept,respilab,drsunanda,micu,rad9,dryogesh,ortho,drshailesh,jitendra.patidar,vini.jhariya,namrata.awasarkar,deepak.sadh,samyak.pancholi,atul.tiwari,lalu.yadav,aleena.soby,muskan.uprale,jitendra.prajapat,maharban.kanesh,dilip.chourasia,gopal.hirlakar,rajesh.yadav,deepak.jaiswal,manoj.hardiya,deepak.mourya,manju.chouhan,kalsing.barde,yogesh.parmar,joy.jisha,kunta.barela,jasma.solanki,ashish.victor,jasslin.verghese,alvi.thomas,jissa.abraham,surbhi.makode,shivani.chouhan,nandini.sharma,rekha.rathore,sunil.malviya,arti.kochale,neha.upadhyay,sofiya.parveen,varsha.kharari,niharika.baraskar,mahima.rathore,aarti.khede,jaya.bariya,preeti.sawner,seemita.yadav,anuradha.dodiya,manjuri.chatterjee,priyanka.prajapat,sonal.yadav,nitu.gupta,reesa.mariam,sherin.anna,minal.bondane,surendra.nayak,shefali.narware,lata.panwar,shivani.mourya,josna.joseph,sheetal.solanki,sherin.shaji,retam.ajnar,ravina.malviya,chouhan.abhishek,neelam.sharma,anjali.jamnik,diksha.jharbade,ishika.devid,dipika.patel,vandana.vishwakarma,poonam.more,kavita.bhawar,shivani.bachhave,seema.dodve,pinky.bamniya,ranu.varma,nisha.patel,raksha.rathore,gokul.rathode,purnima.gupta,sheeta.pateliya,paritosh.rajput,anjali.vishwakarma,surbhi.narware,lalita.solanki,varsha.rathore,nisha.mariyam,aksha.rajan,swati.mujalde,ritu.chouhan,saloni.bhargav,arjun.akhadiya,rajni.chouhan,sonalika.dawar,pooja.morya,hiramani.gehlot,diksha.malviya,sajna.bamniya,ajay.panchal,mithun.chouhan,vikas.patidar,shivani.namdev,rohit.gandhwane,ravindra.solanki,shireen.sheikh,abhishek.agrawal,rekha.choudhary,sandhya.vishwakarmaa,ananya.sharma,ramesh.dawar,lalit.tanwar,anubhav.pandey,huzefa.kachchawala,avani.mahajan,sanyukta.vishnar,dhruvika.joshi,purva.rathore,abhishek.meena,ved.prakash,siddharth.chauhan,gouri.passi,harish.laad,hema.sharma,ankit.yadav,namrata.choudhary,saibaba.suvarna,support.suvarna,yash.tripathi,yashvini.verma`;

const ADMIN_USERS = ['admin', 'itdept', 'it.hardware'];

const DEFAULT_PASSWORD = 'Chrc@12345';

const buildInitialUsers = () => {
  const arr = [
    { username: 'admin', password: 'Admin@CHRC2024', firstLogin: false, role: 'admin', displayName: 'IT Admin', isEmployee: false, isAdmin: true, adminScope: 'all', adminCategories: [] }
  ];
  const parts = USERNAMES_RAW.split(',');
  for (const u of parts) {
    const clean = (u || '').trim().toLowerCase();
    if (!clean) continue;
    const isAdm = ADMIN_USERS.includes(clean);
    arr.push({
      username: clean,
      password: DEFAULT_PASSWORD,
      firstLogin: true,
      role: isAdm ? 'admin' : 'user',
      isEmployee: !isAdm,
      isAdmin: isAdm,
      adminScope: isAdm ? 'all' : 'none',
      adminCategories: [],
      displayName: clean.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    });
  }
  return arr;
};

const INITIAL_USERS = buildInitialUsers();

const COMPLAINT_TYPES = [
  'IT Hardware', 'Network', 'Other Software', 'Suvarna', 'Printer', 'PC/Printer Shifting',
  'Electrical', 'AC', 'Air Cooler', 'Air Curtain', 'Water Cooler', 'RO',
  'Fridge/Freezer', 'Mobile/Charger', 'Gas Plant/Cylinder',
  'Furniture Shifting', 'Furniture Repairing', 'Carpenter', 'Painter',
  'Biomedical Equipment', 'Plumber', 'Welding'
];

// Legacy tickets/users saved the category as "Software"; it is now "Other Software".
const typeKey = (t) => (t === 'Software' ? 'Other Software' : t);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Rating scale collected from the employee once a ticket is resolved
const RATING_OPTIONS = [
  { key: 'excellent', label: 'Excellent', color: '#0f9d58' },
  { key: 'very_good', label: 'Very Good', color: '#4caf50' },
  { key: 'good', label: 'Good', color: '#3388d6' },
  { key: 'satisfied', label: 'Satisfied', color: '#f4a300' },
  { key: 'poor', label: 'Poor', color: '#e53935' },
];

// Statuses: open → hold (Processing) → resolve (auto-closes) / refuse
const STATUS_CFG = {
  open: { label: 'Open', color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)', dot: '#3b82f6' },
  hold: { label: 'Processing', color: '#9a5b0b', bg: 'rgba(217,119,6,0.10)', dot: '#d97706' },
  resolved: { label: 'Resolved', color: '#0f6b46', bg: 'rgba(16,185,129,0.10)', dot: '#10b981' },
  refused: { label: 'Refused', color: '#b42318', bg: 'rgba(239,68,68,0.10)', dot: '#ef4444' },
  closed: { label: 'Closed', color: '#475467', bg: 'rgba(100,116,139,0.10)', dot: '#98a2b3' },
};

// Employee picks this when raising a ticket — lets admins triage at a glance.
// weight is used to sort urgent/unresolved tickets to the top of the list.
const PRIORITY_CFG = {
  low: { label: 'Low', color: '#0f7a3d', bg: '#e4f7ea', weight: 1 },
  medium: { label: 'Medium', color: '#b45309', bg: '#fef3c7', weight: 2 },
  high: { label: 'High', color: '#c0261e', bg: '#fdeaea', weight: 3 },
};
const DEFAULT_PRIORITY = 'medium';

function PriorityBadge({ priority }) {
  const p = PRIORITY_CFG[priority] || PRIORITY_CFG[DEFAULT_PRIORITY];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, color: p.color, background: p.bg, letterSpacing: .2
    }}>
      {p.label}
    </span>
  );
}
// ── ROLE / PERMISSIONS HELPERS ────────────────────────────────
// Derives a normalized permission object from a user record, whether it was
// saved with the new fields (isEmployee/isAdmin/adminScope/adminCategories)
// or is an older record that only has the legacy `role` string.
const headUsernamesOf = (u) => {
  const list = Array.isArray(u && u.headUsernames) ? u.headUsernames : (u && u.headUsername ? [u.headUsername] : []);
  return list.filter(Boolean);
};

const deriveUserPerms = (u) => {
  if (!u) return { isEmployee: false, isAdmin: false, adminScope: 'none', adminCategories: [], isFullAdmin: false, isTechnician: false, headUsernames: [], canAssign: false };
  if (typeof u.isEmployee === 'boolean' || typeof u.isAdmin === 'boolean') {
    const isAdmin = !!u.isAdmin;
    const adminScope = isAdmin ? (u.adminScope === 'categories' ? 'categories' : u.adminScope === 'assigned' ? 'assigned' : 'all') : 'none';
    return {
      isEmployee: !!u.isEmployee,
      isAdmin,
      adminScope,
      adminCategories: Array.isArray(u.adminCategories) ? u.adminCategories.map(typeKey) : [],
      isFullAdmin: isAdmin && adminScope === 'all',
      // Technician = sees only tickets allocated to them. Heads (category admins) and
      // full admins can allocate tickets to technicians.
      isTechnician: isAdmin && adminScope === 'assigned',
      headUsernames: headUsernamesOf(u),
      canAssign: isAdmin && adminScope !== 'assigned'
    };
  }
  // Legacy migration — old records only ever had `role`.
  if (u.role === 'admin') return { isEmployee: false, isAdmin: true, adminScope: 'all', adminCategories: [], isFullAdmin: true, isTechnician: false, headUsernames: [], canAssign: true };
  if (u.role === 'both') return { isEmployee: true, isAdmin: true, adminScope: 'all', adminCategories: [], isFullAdmin: true, isTechnician: false, headUsernames: [], canAssign: true };
  return { isEmployee: true, isAdmin: false, adminScope: 'none', adminCategories: [], isFullAdmin: false, isTechnician: false, headUsernames: [], canAssign: false };
};

const roleSummaryLabel = (perms) => {
  if (!perms.isAdmin) return perms.isEmployee ? 'Employee' : 'No Access';
  const adminPart = perms.adminScope === 'all' ? 'Full Admin' : perms.adminScope === 'assigned' ? 'Technician' : 'Category Admin';
  return perms.isEmployee ? `${adminPart} + Employee` : adminPart;
};

// ── WHATSAPP NOTIFICATION ─────────────────────────────────────
const sendWhatsAppAlert = async (complaint) => {
  if (CALLMEBOT_PHONE && CALLMEBOT_API_KEY) {
    const msg = encodeURIComponent(
      `New IT Ticket - CHRC\n\n` +
      `Ticket: ${complaint.id}\n` +
      `User: ${complaint.userName}\n` +
      `Dept: ${complaint.dept}\n` +
      `Type: ${complaint.type}\n` +
      `Priority: ${(PRIORITY_CFG[complaint.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).label}\n` +
      `Issue: ${complaint.desc.substring(0, 100)}${complaint.desc.length > 100 ? '...' : ''}\n\n` +
      `Please check the helpdesk portal.`
    );
    try {
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${msg}&apikey=${CALLMEBOT_API_KEY}`,
        { mode: 'no-cors' }
      );
    } catch (e) {
      console.warn('WhatsApp alert failed:', e);
    }
  }
};

// ── FIREBASE DB LAYER ─────────────────────────────────────────
const FireDB = {
  async getUsers() {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (snap.empty) return null;
      return snap.docs.map(d => ({ ...d.data(), _id: d.id }));
    } catch (e) { console.error('getUsers:', e); return null; }
  },
  async initUsers(users) {
    try {
      for (const u of users) {
        if (!u.username) continue;
        await setDoc(doc(db, 'users', u.username), u);
      }
    } catch (e) { console.error('initUsers error', e); }
  },
  async updateUser(username, data) {
    try { await updateDoc(doc(db, 'users', username), data); }
    catch (e) { console.error('updateUser:', e); }
  },
  async addUser(userData) {
    try {
      await setDoc(doc(db, 'users', userData.username), userData);
      return true;
    } catch (e) { console.error('addUser:', e); return false; }
  },
  async deleteUser(username) {
    try { await deleteDoc(doc(db, 'users', username)); return true; }
    catch (e) { console.error('deleteUser:', e); return false; }
  },
  // Live-subscribes to a single user's document — used to enforce "one active
  // session per account": if another login overwrites activeSessionId, every
  // other tab/device watching this doc finds out immediately.
  subscribeUserDoc(username, callback) {
    return onSnapshot(doc(db, 'users', username), snap => {
      callback(snap.exists() ? snap.data() : null);
    }, err => { console.error('subscribeUserDoc:', err); });
  },

  async addComplaint(complaint) {
    try {
      const ref = await addDoc(collection(db, 'complaints'), {
        ...complaint,
        createdAt: serverTimestamp()
      });
      return ref.id;
    } catch (e) { console.error('addComplaint:', e); return null; }
  },
  async updateComplaint(id, data) {
    try { await updateDoc(doc(db, 'complaints', id), data); }
    catch (e) { console.error('updateComplaint:', e); }
  },
  async deleteComplaint(id) {
    try { await deleteDoc(doc(db, 'complaints', id)); }
    catch (e) { console.error('deleteComplaint:', e); }
  },
  subscribeComplaints(callback) {
    const q = query(collection(db, 'complaints'), orderBy('at', 'desc'));
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
      callback(data);
    }, err => { console.error('subscribeComplaints:', err); callback([]); });
  },

  async getNextSeq() {
    try {
      const ref = doc(db, 'meta', 'ticket_seq');
      const snap = await getDoc(ref);
      const current = snap.exists() ? (snap.data().value || 1) : 1;
      await setDoc(ref, { value: current + 1 });
      return current;
    } catch { return Date.now(); }
  }
};


// ── ACTIVITY LOGS ─────────────────────────────────────────────
// Every important action is written to the `logs` collection (append-only
// from the UI — there is no edit/delete for logs anywhere in this app).
const LOG_TYPES = {
  ticket: { label: 'Ticket', color: '#1e40af', bg: '#dbeafe' },
  allocation: { label: 'Allocation', color: '#5b21b6', bg: '#f3e8ff' },
  chat: { label: 'Chat', color: '#065f46', bg: '#d1fae5' },
  auth: { label: 'Login / Access', color: '#92400e', bg: '#fef3c7' },
  user: { label: 'User Management', color: '#991b1b', bg: '#fee2e2' },
};

const Logger = {
  // Fire-and-forget: a failed log write must never block or break the UI.
  log(type, action, actor, extra = {}) {
    try {
      addDoc(collection(db, 'logs'), {
        type,
        action,
        actor: (actor && actor.username) || 'unknown',
        actorName: (actor && actor.displayName) || '',
        ticketId: extra.ticketId || '',
        target: extra.target || '',
        details: String(extra.details || '').slice(0, 300),
        at: new Date().toISOString(),
        ts: serverTimestamp()
      }).catch(e => console.warn('log write failed:', e));
    } catch (e) { console.warn('log write failed:', e); }
  },
  subscribe(callback, max = 1000) {
    const q = query(collection(db, 'logs'), orderBy('at', 'desc'), limit(max));
    return onSnapshot(q,
      snap => callback(snap.docs.map(d => ({ ...d.data(), _id: d.id }))),
      err => { console.error('subscribe logs:', err); callback([]); });
  }
};

// ── HELPERS ───────────────────────────────────────────────────
const genTicket = (n) => `IDAR-${String(n).padStart(4, '0')}`;
const now = () => new Date().toISOString();
const fmtDT = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch { return d; }
};

// Human readable duration between two ISO timestamps, e.g. "2d 3h 14m"
const getDuration = (start, end) => {
  if (!start || !end) return '—';
  try {
    const ms = new Date(end) - new Date(start);
    if (isNaN(ms) || ms < 0) return '—';
    const mins = Math.floor(ms / 60000);
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m || parts.length === 0) parts.push(`${m}m`);
    return parts.join(' ');
  } catch { return '—'; }
};

// Safe string compare — the root cause of the original crash
const safeLC = (s) => (s == null ? '' : String(s).toLowerCase());

// One unique id per login — used to enforce a single active session per account.
const genSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2);
};

// ── PRINT: full ticket record (works without pop-ups) ───────────────
const escHtml = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Prints through a hidden iframe so browsers can't block it as a pop-up.
const printHtmlDocument = (html) => {
  try {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(frame);
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try { frame.contentWindow.focus(); frame.contentWindow.print(); }
      catch (e) { console.warn('print failed:', e); }
      setTimeout(() => { try { document.body.removeChild(frame); } catch (e) { /* already removed */ } }, 60000);
    }, 350);
  } catch (e) {
    console.warn('print frame failed, falling back to a new window:', e);
    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) { toast.error('Printing is blocked by the browser. Please allow pop-ups for this site.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }
};

const printComplaint = (c) => {
  const done = c.status === 'resolved' || c.status === 'closed';
  const raisedAt = c.at ? fmtDT(c.at) : 'N/A';
  const resolvedAt = done && c.actionAt ? fmtDT(c.actionAt) : 'N/A';
  const duration = done && c.actionAt ? getDuration(c.at, c.actionAt) : 'N/A';
  const pr = (PRIORITY_CFG[c.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).label;
  const st = STATUS_CFG[c.status]?.label || c.status || 'N/A';
  const P = C.navy;
  const T = (v) => escHtml(na(v));
  const ratingRows = RATING_OPTIONS.map(r => `
    <td style="text-align:center;padding:9px 6px;border:1px solid #d5dbe1;">
      <div style="font-size:15px;">${c.rating === r.key ? '[X]' : '[ ]'}</div>
      <div style="font-size:11px;margin-top:3px;color:#374151;">${r.label}</div>
    </td>`).join('');
  const histRows = (c.history || []).map(h => `
    <tr>
      <td>${escHtml(fmtDT(h.at))}</td>
      <td>${escHtml(STATUS_CFG[h.status]?.label || h.status || 'N/A')}</td>
      <td>${T(h.actionBy || h.by)}</td>
      <td>${T(h.note)}</td>
    </tr>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escHtml(c.id)} - Ticket</title>
  <style>
    @page { margin: 14mm; }
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;margin:0;padding:6px;font-size:12.5px;}
    .head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${P};padding-bottom:12px;margin-bottom:16px;}
    .head h1{font-size:19px;color:${P};margin:0;}
    .head p{font-size:11.5px;color:#6b7280;margin:3px 0 0;}
    .tid{font-size:15px;font-weight:700;color:#fff;background:${P};padding:6px 14px;border-radius:6px;letter-spacing:1px;}
    table.info{width:100%;border-collapse:collapse;margin-bottom:14px;}
    table.info td{border:1px solid #d5dbe1;padding:7px 10px;font-size:12.5px;}
    table.info td.l{background:#f3f6f5;font-weight:600;width:19%;color:#374151;}
    .sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#6b7280;margin:16px 0 6px;}
    .box{border:1px solid #d5dbe1;border-radius:6px;padding:10px 12px;line-height:1.55;font-size:12.5px;}
    table.hist{width:100%;border-collapse:collapse;}
    table.hist th{background:#f3f6f5;text-align:left;font-size:11px;padding:6px 8px;border:1px solid #d5dbe1;color:#374151;}
    table.hist td{padding:6px 8px;border:1px solid #d5dbe1;font-size:12px;vertical-align:top;}
    table.rating{width:100%;border-collapse:collapse;}
    .sign{display:flex;justify-content:space-between;margin-top:46px;}
    .sign div{width:44%;border-top:1px solid #374151;padding-top:6px;text-align:center;font-size:11.5px;color:#374151;}
    .foot{font-size:10.5px;color:#6b7280;margin-top:26px;text-align:center;}
  </style></head><body>
    <div class="head">
      <div><h1>Choithram Hospital &amp; Research Centre</h1><p>IDAR - Complaint &amp; Request Management System</p></div>
      <div class="tid">${escHtml(c.id)}</div>
    </div>
    <table class="info">
      <tr><td class="l">Category</td><td>${T(typeKey(c.type))}</td><td class="l">Priority</td><td>${escHtml(pr)}</td></tr>
      <tr><td class="l">Status</td><td>${escHtml(st)}</td><td class="l">Assigned Technician</td><td>${T(c.assignedToName)}</td></tr>
      <tr><td class="l">Raised By</td><td>${T(c.userName)}</td><td class="l">Employee ID</td><td>${T(c.empId)}</td></tr>
      <tr><td class="l">Department / Location</td><td colspan="3">${T(c.dept)}</td></tr>
      <tr><td class="l">Raised On</td><td>${escHtml(raisedAt)}</td><td class="l">Resolved On</td><td>${escHtml(resolvedAt)}</td></tr>
      <tr><td class="l">Time Taken</td><td>${escHtml(duration)}</td><td class="l">Resolved By</td><td>${T(done ? c.actionBy : '')}</td></tr>
    </table>
    <div class="sec">Issue Description</div>
    <div class="box">${T(c.desc)}</div>
    <div class="sec">Action Taken / Solution</div>
    <div class="box">${T(c.solution)}</div>
    <div class="sec">Status History</div>
    <table class="hist"><tr><th style="width:22%">Date &amp; Time</th><th style="width:14%">Status</th><th style="width:18%">By</th><th>Details</th></tr>${histRows || '<tr><td colspan="4">N/A</td></tr>'}</table>
    ${done ? `
      <div class="sec">Employee Remark</div>
      <div class="box">${T(c.ratingRemark)}</div>
      <div class="sec">Employee Satisfaction Rating</div>
      <table class="rating"><tr>${ratingRows}</tr></table>` : ''}
    <div class="sign"><div>Employee Signature</div><div>IT / Maintenance Team Signature</div></div>
    <div class="foot">Printed on ${escHtml(fmtDT(now()))} | Choithram Hospital &amp; Research Centre - IDAR Ticket System</div>
  </body></html>`;
  printHtmlDocument(html);
};

// ── THEME ─────────────────────────────────────────────────────
// C holds the live colour tokens. Choosing a theme overwrites the tokens that
// define the look (navbar, buttons, accents, page tint) and re-renders the app.
const C = {
  navy: '#0f4c43', navy2: '#0c3d36', navy3: '#14705f',
  gold: '#14876e', gold2: '#1ba386', goldL: '#e9f4f0',
  white: '#ffffff', off: '#f5f8f7', card: 'rgba(255,255,255,0.56)',
  border: '#e1e9e6', border2: '#cdd8d4',
  text: '#17231f', text2: '#37463f', muted: '#6b7a73',
  green: '#177a45', greenL: '#eef7f1',
  yellow: '#a8560a', yellowL: '#fbf5e6',
  red: '#b42318', redL: '#fcf0ef',
  blue: '#0f4c43', blueL: '#e9f4f0',
  accent: '#0f4c43',
  // glass tokens (constant across themes)
  glass: 'rgba(255,255,255,0.56)', glassHi: 'rgba(255,255,255,0.78)', glassPop: 'rgba(255,255,255,0.93)',
  field: 'rgba(255,255,255,0.70)', inset: 'rgba(255,255,255,0.40)', row1: 'rgba(255,255,255,0.50)', row2: 'rgba(255,255,255,0.24)',
};

const THEMES = {
  emerald: { label: 'Emerald', navy: '#0f4c43', navy2: '#0c3d36', navy3: '#14705f', gold: '#14876e', gold2: '#1ba386', goldL: '#e9f4f0', off: '#f5f8f7', border: '#e1e9e6', border2: '#cdd8d4', blue: '#0f4c43', blueL: '#e9f4f0', accent: '#0f4c43' },
  ocean: { label: 'Ocean Blue', navy: '#1d4f91', navy2: '#163d72', navy3: '#2b6cb8', gold: '#2f7fd1', gold2: '#4a97e6', goldL: '#e8f1fb', off: '#f4f7fb', border: '#dfe7f1', border2: '#c8d5e6', blue: '#1d4f91', blueL: '#e8f1fb', accent: '#1d4f91' },
  indigo: { label: 'Royal Indigo', navy: '#4338ca', navy2: '#312e81', navy3: '#4f46e5', gold: '#6366f1', gold2: '#818cf8', goldL: '#eef0ff', off: '#f6f6fc', border: '#e4e5f3', border2: '#d0d1e9', blue: '#4338ca', blueL: '#eef0ff', accent: '#4338ca' },
  teal: { label: 'Teal', navy: '#0e7490', navy2: '#0b5e75', navy3: '#0f8aab', gold: '#0891b2', gold2: '#22b3d3', goldL: '#e6f6fa', off: '#f3f8fa', border: '#dbe8ed', border2: '#c3d6de', blue: '#0e7490', blueL: '#e6f6fa', accent: '#0e7490' },
  slate: { label: 'Graphite', navy: '#334155', navy2: '#1e293b', navy3: '#475569', gold: '#0f766e', gold2: '#14998f', goldL: '#eef2f6', off: '#f5f7f9', border: '#e2e8f0', border2: '#cbd5e1', blue: '#334155', blueL: '#eef2f6', accent: '#334155' },
  burgundy: { label: 'Burgundy', navy: '#9f1239', navy2: '#7f0f2e', navy3: '#bf1e4d', gold: '#d6336c', gold2: '#e5567f', goldL: '#fdf0f3', off: '#faf6f7', border: '#efe2e5', border2: '#e0cdd2', blue: '#9f1239', blueL: '#fdf0f3', accent: '#9f1239' },
  luxe: { label: 'Obsidian Gold', navy: '#1b1d24', navy2: '#101217', navy3: '#2c303b', gold: '#9a6a12', gold2: '#c8962e', goldL: '#f8f0dc', off: '#f7f5ef', border: '#ebe4d2', border2: '#d9cfb6', blue: '#1b1d24', blueL: '#f8f0dc', accent: '#1b1d24' },
};

// Cursor-follow spotlight for glass cards (one global listener, rAF-throttled)
if (typeof window !== 'undefined' && !window.__glassSpot) {
  window.__glassSpot = true;
  let raf = 0;
  window.addEventListener('pointermove', (e) => {
    if (raf || e.pointerType === 'touch') return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const el = e.target && e.target.closest ? e.target.closest('.glass-card') : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width > 640) return;
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }, { passive: true });
}

const THEME_STORE_KEY = 'idar_theme';
const applyTheme = (key) => {
  const k = THEMES[key] ? key : 'emerald';
  const tokens = { ...THEMES[k] };
  delete tokens.label;
  Object.assign(C, tokens);
  return k;
};
const readSavedTheme = () => {
  try { return window.localStorage.getItem(THEME_STORE_KEY) || 'emerald'; } catch (e) { return 'emerald'; }
};
applyTheme(readSavedTheme());
const ThemeContext = createContext({ key: 'emerald', setKey: () => {} });

// A ticket that sees no activity for this many hours (by priority) is treated as
// overdue — the assistant then reminds the technician / department head.
const SLA_HOURS = { high: 1, medium: 4, low: 8 };

const na = (v) => (v === undefined || v === null || String(v).trim() === '' ? 'N/A' : v);

const fmtSpan = (ms) => {
  const mins = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m || parts.length === 0) parts.push(`${m}m`);
  return parts.join(' ');
};

const lastActivityAt = (c) => {
  const h = c.history || [];
  const last = h.length ? h[h.length - 1].at : null;
  return last || c.assignedAt || c.at;
};

// Returns null unless the ticket is active and has been idle past its SLA limit.
const slaState = (c, nowMs) => {
  if (!c || !(c.status === 'open' || c.status === 'hold')) return null;
  const limit = (SLA_HOURS[c.priority] || SLA_HOURS.medium) * 3600000;
  const since = new Date(lastActivityAt(c)).getTime();
  if (!since || isNaN(since)) return null;
  const idle = nowMs - since;
  if (!(idle >= limit)) return null;
  return { idle, limit, n: Math.floor(idle / limit) };
};

const useNowTick = (ms = 60000) => {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
};

const buildGS = () => `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Playfair+Display:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{-webkit-text-size-adjust:100%;overflow-x:hidden;}
html,body{width:100%;}
:root{--nav-h:112px;}
body{position:relative;background:${C.off};font-family:'DM Sans',sans-serif;color:${C.text};font-size:15px;}
body::before{content:'';position:fixed;inset:-25%;z-index:-1;pointer-events:none;will-change:transform;
  background:radial-gradient(620px 470px at 18% 22%,${C.gold}3d,transparent 65%),radial-gradient(700px 530px at 82% 14%,${C.navy3}33,transparent 65%),radial-gradient(640px 520px at 74% 86%,#a78bfa33,transparent 65%),radial-gradient(580px 450px at 12% 88%,#fbbf2433,transparent 65%),radial-gradient(900px 600px at 50% 50%,#ffffff99,transparent 70%);
  animation:aurora 38s ease-in-out infinite alternate;}
body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");}
@keyframes aurora{0%{transform:translate3d(-2%,-1%,0) rotate(0deg) scale(1)}50%{transform:translate3d(2%,2%,0) rotate(4deg) scale(1.06)}100%{transform:translate3d(-1%,3%,0) rotate(-3deg) scale(1.02)}}
::selection{background:${C.gold}40;}
input,select,textarea,button{font-family:'DM Sans',sans-serif;}
input,select,textarea{-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);}
option{background:#fff;color:${C.text};}
img{max-width:100%;height:auto;}
button,select,input,a{touch-action:manipulation;}
input:focus,select:focus,textarea:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px ${C.gold}2e,0 6px 18px ${C.gold}22!important;outline:none;background:rgba(255,255,255,.92)!important;}
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,${C.gold}88,${C.navy3}88);border-radius:99px;border:2px solid transparent;background-clip:padding-box;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@keyframes typingDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}
.fadeUp{animation:fadeUp .25s ease-out both;}
@keyframes toastIn{from{opacity:0;transform:translateY(-10px) scale(.97)}to{opacity:1;transform:none}}
@keyframes drawCheck{from{stroke-dashoffset:26}to{stroke-dashoffset:0}}
.toast-in{animation:toastIn .28s cubic-bezier(.2,.8,.2,1) both;}
.toast-check{stroke-dasharray:26;stroke-dashoffset:26;animation:drawCheck .45s .12s ease-out forwards;}

/* ── GLASS CARD: frosted body + mirror-edge ring + cursor spotlight ── */
.glass-card{position:relative;isolation:isolate;background:${C.glass};-webkit-backdrop-filter:blur(18px) saturate(170%);backdrop-filter:blur(18px) saturate(170%);border:1px solid rgba(255,255,255,.62);box-shadow:0 10px 32px ${C.navy}14,0 2px 6px rgba(16,24,40,.05),inset 0 1px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(255,255,255,.25);transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease;}
.glass-card::before{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s ease;background:radial-gradient(280px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.75),${C.gold}1c 45%,transparent 70%);}
.glass-card::after{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.08) 38%,rgba(255,255,255,.22) 62%,rgba(255,255,255,.85));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;}
.glass-card:hover{z-index:3;background:${C.glassHi};border-color:rgba(255,255,255,.9);}
.glass-card:hover::before{opacity:1;}
.glass-card:focus-within{z-index:40;}
.hover-lift:hover{transform:translateY(-3px);box-shadow:0 22px 48px ${C.navy}26,0 4px 10px rgba(16,24,40,.06),inset 0 1px 0 rgba(255,255,255,.95);}

.idar-btn{position:relative;overflow:hidden;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease,background .18s ease;}
.idar-btn:not(.idar-btn-solid){-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);}
.idar-btn-solid{box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset 0 -8px 14px rgba(0,0,0,.10)!important;}
.idar-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.07) saturate(1.06);box-shadow:0 10px 24px ${C.navy}38,inset 0 1px 0 rgba(255,255,255,.45)!important;}
.idar-btn:active:not(:disabled){transform:translateY(0);filter:brightness(.98);}
.idar-btn-solid::after{content:'';position:absolute;top:0;bottom:0;left:-60%;width:45%;background:linear-gradient(110deg,transparent,rgba(255,255,255,.42),transparent);transform:skewX(-20deg);transition:left .65s ease;pointer-events:none;}
.idar-btn-solid:hover:not(:disabled)::after{left:130%;}
.idar-btn:not(.idar-btn-solid):hover:not(:disabled){background:rgba(255,255,255,.92)!important;}
.nav-btn{transition:background .18s ease,transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
.nav-btn:hover{background:rgba(255,255,255,0.26)!important;border-color:rgba(255,255,255,0.6)!important;transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.18);}
.tab-btn{transition:color .18s ease,background .18s ease,border-color .18s ease;}
.tab-btn:hover{color:${C.navy}!important;background:rgba(255,255,255,.8)!important;}
.menu-item{transition:background .15s ease;}
.menu-item:hover{background:${C.gold}22!important;}
button:focus-visible{outline:2px solid ${C.gold};outline-offset:2px;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}}

/* ── LAYERING: nothing hides behind anything ── */
.page-main{transition:padding-right .25s ease;padding-bottom:96px!important;}
@media(min-width:1500px){body.assistant-docked .page-main{margin-right:344px!important;}body.assistant-docked .modal-overlay{right:344px!important;}}
.assistant-panel{top:auto!important;height:min(500px,calc(100vh - var(--nav-h,112px) - 28px))!important;}
.modal-overlay{overscroll-behavior:contain;}
.login-left,.login-right{position:relative;z-index:1;}
.sticky-table{overflow:auto;}
.app-shell{display:flex;flex-direction:column;height:calc(100vh - var(--nav-h,112px) - 40px);min-height:420px;margin-bottom:-84px;}
.app-scroll{flex:1;min-height:0;overflow-y:auto;padding:2px 6px 8px 2px;align-content:start;}
.app-fill{flex:1;min-height:0;display:flex;flex-direction:column;}
@media(max-width:760px){.app-shell{height:auto;min-height:0;margin-bottom:0;}.app-scroll,.app-fill{flex:none;overflow:visible;}.app-fill .sticky-table{flex:none!important;max-height:70vh;}}
.sticky-table thead th{position:sticky;top:0;z-index:5;background:${C.goldL};box-shadow:0 1px 0 ${C.border2};}
.fadeIn{animation:fadeIn .3s ease both;}
.slideDown{animation:slideDown .18s ease both;}
.pulse{animation:pulse 2.5s infinite;}
.ticket-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px;}
.detail-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start;}
.action-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.action-grid button{width:100%;}
@media(max-width:900px){
  .detail-grid{grid-template-columns:1fr;}
  .detail-side{order:-1;}
  .login-left{display:none!important;}
  .login-right{flex:1 1 100%!important;}
}
@media(max-width:640px){
  .hide-sm{display:none!important;}
  .grid-2{grid-template-columns:1fr!important;}
  .grid-3{grid-template-columns:1fr 1fr!important;}
  .assistant-panel{right:10px!important;bottom:10px!important;}
  body{font-size:14px;}
}
@media(max-width:420px){
  .ticket-grid{grid-template-columns:1fr;}
  .action-grid{grid-template-columns:1fr;}
}
@media(max-width:380px){
  body{font-size:13.5px;}
}
@supports(padding:max(0px)){
  body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);}
}
/* fallbacks when the browser has no backdrop-filter or user asks for less transparency */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .glass-card{background:rgba(255,255,255,.92);}
  input,select,textarea{background:#fff!important;}
}
@media(prefers-reduced-transparency:reduce){
  .glass-card{background:rgba(255,255,255,.95);-webkit-backdrop-filter:none;backdrop-filter:none;}
  body::before{animation:none;}
}
`;

// Catches any unexpected render/runtime error anywhere below it so a bug in
// one screen shows a friendly recoverable message instead of a blank white
// crash — important on phones/tablets where users can't see a console.
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('App crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, background: '#f4f8f6', fontFamily: "'DM Sans',sans-serif", textAlign: 'center'
        }}>
          <div style={{ maxWidth: 380 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#132621', marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13.5, color: '#68786f', marginBottom: 18, lineHeight: 1.6 }}>
              This screen hit an unexpected error. Your data is safe — just reload to continue.
            </div>
            <button onClick={() => window.location.reload()} style={{
              background: C.navy, color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}>Reload App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
function Btn({ children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false, type = 'button', title }) {
  const vs = {
    primary: { background: `linear-gradient(135deg,${C.navy},${C.navy3})`, color: '#fff', border: `1px solid ${C.navy}`, boxShadow: `0 1px 3px ${C.navy}40` },
    gold: { background: `linear-gradient(135deg,${C.gold},${C.gold2})`, color: '#fff', border: `1px solid ${C.gold}`, boxShadow: `0 1px 3px ${C.gold}40` },
    success: { background: 'linear-gradient(135deg,#146b3b,#1c8a4c)', color: '#fff', border: '1px solid #146b3b', boxShadow: '0 1px 3px rgba(20,107,59,0.35)' },
    danger: { background: C.glassHi, color: C.red, border: `1px solid ${C.red}66` },
    warning: { background: C.glassHi, color: C.yellow, border: `1px solid ${C.yellow}66` },
    purple: { background: `linear-gradient(135deg,${C.gold},${C.gold2})`, color: '#fff', border: `1px solid ${C.gold}`, boxShadow: `0 1px 3px ${C.gold}40` },
    soft: { background: C.goldL, color: C.navy, border: `1px solid ${C.border2}` },
    ghost: { background: 'transparent', color: C.muted, border: `1px solid ${C.border2}` },
    outline: { background: C.glassHi, color: C.navy, border: `1px solid ${C.navy}80` },
  };
  const ss = {
    sm: { padding: '7px 14px', fontSize: 12.5, borderRadius: 8 },
    md: { padding: '10px 20px', fontSize: 14, borderRadius: 9 },
    lg: { padding: '13px 28px', fontSize: 15, borderRadius: 10 }
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`idar-btn${['primary', 'gold', 'success', 'purple'].includes(variant) ? ' idar-btn-solid' : ''}`}
      style={{
        ...vs[variant], ...ss[size], fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .55 : 1, letterSpacing: .1, ...style
      }}>
      {children}
    </button>
  );
}

function Card({ children, style = {}, className = '', ...rest }) {
  return (
    <div className={`glass-card ${className}`.trim()} {...rest}
      style={{ borderRadius: 16, ...style }}>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const m = STATUS_CFG[status] || { label: status, color: C.muted, bg: 'rgba(100,116,139,0.10)', dot: C.muted };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, color: m.color, background: m.bg, letterSpacing: .2, whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function KpiTile({ label, value, note, color }) {
  return (
    <div className="hover-lift glass-card" style={{ background: `linear-gradient(145deg,${color}26,${color}0a),${C.glass}`, borderRadius: 16, padding: '14px 16px', minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, margin: '6px 0 2px', lineHeight: 1.1 }}>{value}</div>
      {note && <div style={{ fontSize: 11.5, color: C.muted }}>{note}</div>}
    </div>
  );
}

// Rendered through a portal into <body>, so a dialog can never be clipped, trapped or
// covered by a glass card / transformed ancestor. It always sits below the navbar.
function Modal({ open, onClose, title, children, width = 520, fullscreen = false, z = 1000 }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    let prev = '';
    if (fullscreen) { prev = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'; }
    return () => {
      document.removeEventListener('keydown', onKey);
      if (fullscreen) document.documentElement.style.overflow = prev;
    };
  }, [open, fullscreen, onClose]);
  if (!open) return null;
  const headBg = `linear-gradient(100deg,${C.navy2}f2,${C.navy3}e6)`;
  const closeBtn = (
    <button onClick={onClose} aria-label="Close" className="nav-btn" style={{
      background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.45)',
      color: '#fff', fontSize: 20, cursor: 'pointer', lineHeight: 1, width: 34, height: 34,
      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>&times;</button>
  );
  const overlay = {
    position: 'fixed', left: 0, right: 0, bottom: 0, top: 'var(--nav-h, 0px)', zIndex: z,
    background: 'rgba(15,23,42,0.30)', backdropFilter: 'blur(12px) saturate(140%)', WebkitBackdropFilter: 'blur(12px) saturate(140%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: fullscreen ? 16 : 12
  };
  const panel = {
    background: 'linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))',
    backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 30px 80px rgba(15,23,42,0.32), inset 0 1px 0 rgba(255,255,255,0.95)'
  };
  const node = fullscreen ? (
    <div className="fadeIn modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={overlay}>
      <div className="fadeUp" style={{
        ...panel, width: '100%', maxWidth: 1560, height: '100%', borderRadius: 22, overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ background: headBg, color: '#fff', flexShrink: 0, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)' }}>
          <div style={{ fontWeight: 600, fontSize: 16, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          {closeBtn}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 28px' }}>{children}</div>
      </div>
    </div>
  ) : (
    <div className="fadeIn modal-overlay" style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fadeUp" style={{
        ...panel, borderRadius: 22, width: '100%', maxWidth: Math.round(width * 1.15),
        maxHeight: 'calc(100vh - var(--nav-h, 0px) - 24px)', overflow: 'auto'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          padding: '14px 20px', background: headBg, position: 'sticky', top: 0, borderRadius: '22px 22px 0 0', zIndex: 2,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)'
        }}>
          <span style={{ fontWeight: 600, fontSize: 15.5, color: '#fff' }}>{title}</span>
          {closeBtn}
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
  return createPortal(node, document.body);
}

const LOGIN_SLIDES = [
  {
    id: 1,
    image: hospitalImg1,
    title: 'Complaint & Request Management',
    desc: 'Raise IT, electrical, civil, biomedical and other facility tickets in seconds — and track every step, from open to resolved, without leaving your desk.'
  },
  {
    id: 2,
    image: hospitalImg2,
    title: 'Quick & Easy Ticket Resolution',
    desc: 'Submit complaints and service requests easily, track their progress, and stay updated until the issue is resolved.'
  },
  {
    id: 3,
    image: hospitalImg3,
    title: 'Better Healthcare Support',
    desc: 'Connect departments, streamline service requests, and improve support operations across the hospital.'
  }
];

// Full-page water background for the login screen. The page background (soft aurora colours + dot grid) is
// painted into a canvas, then a real height-field wave simulation refracts it: mouse / touch / click and random
// raindrops send ripples across the WHOLE page behind the cards. Colours stay the same as the normal theme.
function WaterBackground() {
  const canvasRef = useRef(null);
  const sig = `${C.gold}${C.navy3}${C.navy}${C.off}${C.border2}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const DAMP = 0.99, REFR = 0.05, SHADE = 0.11, MAXD = 12;
    let W = 0, H = 0, scale = 1, cw = 0, ch = 0;
    let srcData = null, srcU32 = null, outImg = null, outU32 = null;
    let hA = null, hB = null;
    let raf = 0, running = false, quiet = 0, ready = false, dead = false, rainTimer = 0, resizeTimer = 0;
    let lastX = -999, lastY = -999;

    const paint = (g) => {
      g.fillStyle = C.off; g.fillRect(0, 0, W, H);
      const blob = (fx, fy, fr, col, a) => {
        const x = fx * W, y = fy * H, r = fr * W;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, col + a); gr.addColorStop(1, col + '00');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      };
      blob(0.18, 0.22, 0.34, C.gold, '3d');
      blob(0.82, 0.14, 0.36, C.navy3, '33');
      blob(0.74, 0.86, 0.34, '#a78bfa', '33');
      blob(0.12, 0.88, 0.30, '#fbbf24', '33');
      blob(0.50, 0.50, 0.50, '#ffffff', '99');
      // dot grid (gives the water something to bend)
      const gap = Math.max(10, 22 * scale), rad = Math.max(0.8, 1.1 * scale);
      g.fillStyle = C.border2;
      for (let y = gap / 2; y < H; y += gap) {
        for (let x = gap / 2; x < W; x += gap) {
          g.globalAlpha = x < W * 0.58 ? 0.6 : 0.26;
          g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill();
        }
      }
      g.globalAlpha = 1;
    };

    const build = () => {
      cw = window.innerWidth; ch = window.innerHeight;
      if (!cw || !ch) return;
      scale = Math.min(1, 1100 / cw);
      W = Math.round(cw * scale); H = Math.round(ch * scale);
      canvas.width = W; canvas.height = H;
      const tmp = document.createElement('canvas');
      tmp.width = W; tmp.height = H;
      const tctx = tmp.getContext('2d');
      paint(tctx);
      try { srcData = tctx.getImageData(0, 0, W, H); } catch (e) { ready = false; return; }
      srcU32 = new Uint32Array(srcData.data.buffer);
      outImg = ctx.createImageData(W, H);
      outU32 = new Uint32Array(outImg.data.buffer);
      hA = new Float32Array(W * H);
      hB = new Float32Array(W * H);
      ctx.putImageData(srcData, 0, 0);
      canvas.style.opacity = '1';
      ready = true;
    };

    const frame = () => {
      raf = 0;
      if (!ready || dead) { running = false; return; }
      for (let k = 0; k < 2; k++) {
        for (let y = 1; y < H - 1; y++) {
          let i = y * W + 1;
          for (let x = 1; x < W - 1; x++, i++) {
            hB[i] = ((hA[i - 1] + hA[i + 1] + hA[i - W] + hA[i + W]) * 0.5 - hB[i]) * DAMP;
          }
        }
        const t = hA; hA = hB; hB = t;
      }
      const sd = srcData.data, od = outImg.data;
      let maxH = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          if (x === 0 || y === 0 || x === W - 1 || y === H - 1) { outU32[i] = srcU32[i]; continue; }
          const v = hA[i];
          const av = v < 0 ? -v : v;
          if (av > maxH) maxH = av;
          const gx = hA[i - 1] - hA[i + 1];
          const gy = hA[i - W] - hA[i + W];
          if (gx * gx + gy * gy < 4) { outU32[i] = srcU32[i]; continue; }
          let dx = Math.round(gx * REFR), dy = Math.round(gy * REFR);
          if (dx > MAXD) dx = MAXD; else if (dx < -MAXD) dx = -MAXD;
          if (dy > MAXD) dy = MAXD; else if (dy < -MAXD) dy = -MAXD;
          let sx = x + dx, sy = y + dy;
          if (sx < 0) sx = 0; else if (sx > W - 1) sx = W - 1;
          if (sy < 0) sy = 0; else if (sy > H - 1) sy = H - 1;
          const si = (sy * W + sx) * 4, o = i * 4;
          const shade = (gx - gy) * SHADE;
          od[o] = sd[si] + shade; od[o + 1] = sd[si + 1] + shade; od[o + 2] = sd[si + 2] + shade; od[o + 3] = 255;
        }
      }
      ctx.putImageData(outImg, 0, 0);
      quiet = maxH < 0.4 ? quiet + 1 : 0;
      if (quiet > 12) {
        ctx.putImageData(srcData, 0, 0);
        hA.fill(0); hB.fill(0);
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !ready || dead) return;
      running = true; quiet = 0;
      raf = requestAnimationFrame(frame);
    };

    const drop = (px, py, strength, radius) => {
      if (!ready) return;
      const r = Math.max(3, Math.round(radius * scale));
      const cx = Math.round(px), cy = Math.round(py);
      for (let y = -r; y <= r; y++) {
        const yy = cy + y;
        if (yy < 1 || yy >= H - 1) continue;
        for (let x = -r; x <= r; x++) {
          const xx = cx + x;
          if (xx < 1 || xx >= W - 1) continue;
          const d = Math.sqrt(x * x + y * y);
          if (d > r) continue;
          hA[yy * W + xx] += strength * 0.5 * (1 + Math.cos(Math.PI * d / r));
        }
      }
      start();
    };

    const onMove = (e) => {
      if (!ready) return;
      const x = e.clientX * (W / cw), y = e.clientY * (H / ch);
      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist < 8) return;
      lastX = x; lastY = y;
      drop(x, y, 170 + Math.min(dist, 60) * 3, 12);
    };
    const onDown = (e) => { if (ready) drop(e.clientX * (W / cw), e.clientY * (H / ch), 520, 22); };
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 180); };

    const rain = () => {
      if (dead) return;
      if (ready && !document.hidden) drop(Math.random() * W, Math.random() * H, 240 + Math.random() * 200, 10 + Math.random() * 10);
      rainTimer = setTimeout(rain, 1600 + Math.random() * 2400);
    };

    build();
    if (ready) { drop(W * 0.3, H * 0.5, 380, 20); rainTimer = setTimeout(rain, 2200); }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(rainTimer); clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
    };
  }, [sig]);

  return (
    <canvas ref={canvasRef} aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', opacity: 0, transition: 'opacity .5s ease' }} />
  );
}

// Auto-rotating slider with a soft glass panel + mirror-style reflection under the artwork
function LoginSlider() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % LOGIN_SLIDES.length);
    }, 4500);

    return () => clearInterval(t);
  }, []);

  const slide = LOGIN_SLIDES[idx];

  return (
    <>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0',
          position: 'relative'
        }}
      >

        {/* MAIN IMAGE */}
        <div
          className="fadeIn"
          key={idx}
          style={{
            width: '100%',
            maxWidth: 460,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: `0 24px 60px ${C.navy}1c`
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              width: '100%',
              height: 320,
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>

        {/* REFLECTION */}
        <div
          style={{
            width: '100%',
            maxWidth: 460,
            height: 70,
            marginTop: -6,
            borderRadius: 20,
            overflow: 'hidden',
            transform: 'scaleY(-1)',
            opacity: 0.12,
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
            pointerEvents: 'none'
          }}
        >
          <img
            src={slide.image}
            alt=""
            style={{
              width: '100%',
              height: 320,
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>

      </div>

      {/* SLIDER DOTS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          marginBottom: 18
        }}
      >
        {LOGIN_SLIDES.map((_, i) => (
          <span
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 22 : 8,
              height: 8,
              borderRadius: 99,
              cursor: 'pointer',
              background: i === idx ? C.navy : C.border2,
              transition: 'all .2s'
            }}
          />
        ))}
      </div>

      {/* TITLE */}
      <div
        className="fadeIn"
        key={'t' + idx}
        style={{
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: C.navy,
            marginBottom: 8
          }}
        >
          {slide.title}
        </h2>

        <p
          style={{
            color: C.text2,
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: 480,
            margin: '0 auto'
          }}
        >
          {slide.desc}
        </p>
      </div>
    </>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 700,
      letterSpacing: .6, textTransform: 'uppercase'
    }}>
      {children}{required && <span style={{ color: C.red }}> *</span>}
    </label>
  );
}

const inputStyle = {
  width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none',
  transition: 'border .15s, box-shadow .15s, background .15s', lineHeight: 1.4, boxShadow: 'inset 0 1px 3px rgba(16,24,40,0.07), 0 1px 0 rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
  get background() { return C.field; },
  get border() { return `1px solid ${C.border2}`; },
  get color() { return C.text; },
};

// ── SEARCHABLE DROPDOWN (supports free-text / custom entries) ─────────
function SearchDropdown({ label, value, onChange, options, placeholder = 'Search...', required = false, allowCustom = false }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = useMemo(() =>
    q ? options.filter(o => safeLC(o).includes(q.toLowerCase())) : options,
    [q, options]
  );
  const typedTrim = q.trim();
  const hasExactMatch = options.some(o => safeLC(o) === safeLC(typedTrim));
  const showCustomRow = allowCustom && open && typedTrim.length > 0 && !hasExactMatch;

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const commitCustom = () => {
    if (!typedTrim) return;
    onChange(typedTrim);
    setOpen(false);
    setQ('');
  };

  return (
    <div style={{ marginBottom: 18, position: 'relative' }} ref={ref}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ position: 'relative' }}>
        <input
          value={open ? q : value}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQ(''); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered.length === 1) { onChange(filtered[0]); setOpen(false); setQ(''); }
              else if (allowCustom && typedTrim) { commitCustom(); }
            } else if (e.key === 'Escape') { setOpen(false); setQ(''); }
          }}
          placeholder={value || placeholder}
          style={{ ...inputStyle, paddingRight: 38 }}
        />
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          color: C.muted, fontSize: 11, pointerEvents: 'none'
        }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (filtered.length > 0 || showCustomRow) && (
        <div className="slideDown" style={{
          position: 'absolute', zIndex: 300, background: C.glassPop, backdropFilter: 'blur(22px) saturate(170%)', WebkitBackdropFilter: 'blur(22px) saturate(170%)',
          border: `1.5px solid ${C.border2}`, borderRadius: 12, marginTop: 3,
          maxHeight: 240, overflow: 'auto', boxShadow: '0 12px 32px #0b2a2220', width: '100%', left: 0
        }}>
          {filtered.map(o => (
            <div key={o} onMouseDown={() => { onChange(o); setOpen(false); setQ(''); }}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: C.text,
                background: value === o ? C.blueL : 'transparent', fontWeight: value === o ? 600 : 400,
                transition: 'background .1s', borderRadius: 4
              }}
              onMouseEnter={e => { if (value !== o) e.currentTarget.style.background = C.goldL; }}
              onMouseLeave={e => { if (value !== o) e.currentTarget.style.background = 'transparent'; }}>
              {o}
            </div>
          ))}
          {showCustomRow && (
            <div onMouseDown={commitCustom}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: C.navy, fontWeight: 700,
                borderTop: filtered.length ? `1px solid ${C.border}` : 'none', background: C.goldL
              }}>
              + Use "{typedTrim}" (not in list — type your own department/location)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Shared by the Add User and Edit User dialogs.
function UserTypeFields({ form, set, headOptions }) {
  const radio = (value, title, desc) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: C.text2, padding: '8px 0', cursor: 'pointer' }}>
      <input type="radio" style={{ marginTop: 3 }} checked={form.userType === value} onChange={() => set('userType', value)} />
      <span><strong style={{ color: C.text }}>{title}</strong><span style={{ color: C.muted }}> — {desc}</span></span>
    </label>
  );
  const toggle = (key, val) => {
    const list = form[key] || [];
    set(key, list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };
  const chipBtn = { fontSize: 11.5, background: 'none', border: `1px solid ${C.border2}`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer', color: C.text2 };
  const listBox = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 8, maxHeight: 200, overflow: 'auto', background: C.glassHi, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 };
  const heads = form.headUsernames || [];
  const cats = form.adminCategories || [];
  return (
    <div style={{ marginBottom: 16, background: C.inset, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px' }}>
      <FieldLabel>User Type</FieldLabel>
      {radio('employee', 'Employee', 'raises and tracks own tickets')}
      {radio('categoryAdmin', 'Head / Category Admin', 'manages selected categories and allocates tickets to technicians')}
      {radio('technician', 'Technician', 'works only on tickets allocated by a head')}
      {radio('fullAdmin', 'Full Admin', 'all categories, users and logs')}

      {(form.userType === 'categoryAdmin' || form.userType === 'fullAdmin' || form.userType === 'technician') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.text2, margin: '8px 0 0', paddingTop: 12, borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!form.alsoEmployee} onChange={e => set('alsoEmployee', e.target.checked)} />
          Also allow raising own tickets (Employee view)
        </label>
      )}

      {form.userType === 'technician' && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text2 }}>Reports to (one or more heads)</span>
            <span style={{ fontSize: 11.5, color: C.muted }}>{heads.length} selected</span>
          </div>
          {headOptions.length === 0 ? (
            <div style={{ fontSize: 12.5, color: C.muted }}>No heads available. Create a Head / Category Admin first.</div>
          ) : (
            <div style={listBox}>
              {headOptions.map(h => (
                <label key={h.username} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.text2, cursor: 'pointer' }}>
                  <input type="checkbox" checked={heads.includes(h.username)} onChange={() => toggle('headUsernames', h.username)} />
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.displayName || h.username}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {form.userType === 'categoryAdmin' && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text2, marginBottom: 8 }}>Categories managed</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => set('adminCategories', [...COMPLAINT_TYPES])} style={chipBtn}>Select all</button>
            <button type="button" onClick={() => set('adminCategories', [])} style={chipBtn}>Clear</button>
            <span style={{ fontSize: 11.5, color: C.muted }}>{cats.length} selected</span>
          </div>
          <div style={listBox}>
            {COMPLAINT_TYPES.map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.text2, cursor: 'pointer' }}>
                <input type="checkbox" checked={cats.includes(t)} onChange={() => toggle('adminCategories', t)} />
                {t}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

// ── STATUS TIMELINE ───────────────────────────────────────────
function Timeline({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div style={{ position: 'relative' }}>
      {history.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 14 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: STATUS_CFG[h.status]?.dot || C.muted, marginTop: 5, flexShrink: 0
            }} />
            {i < history.length - 1 && (
              <div style={{ width: 1, flex: 1, background: C.border2, margin: '4px 0', minHeight: 18 }} />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: 2, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge status={h.status} />
                {h.actionBy && <span style={{ fontSize: 12, color: C.text2, fontWeight: 600 }}>{h.actionBy}</span>}
              </div>
              <span style={{ fontSize: 11, color: C.muted }}>{fmtDT(h.at)}</span>
            </div>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.55, wordBreak: 'break-word' }}>{h.note}</div>
            {h.by && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Raised by {h.by}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-3.9-4-7.2-9-7.2z" />
      <circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.2" r="1" /><circle cx="14.5" cy="7.2" r="1" />
    </svg>
  );
}

const NAV_ICON_BTN = {
  position: 'relative', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.32)',
  borderRadius: 8, width: 36, height: 36, cursor: 'pointer', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

function ThemeMenu({ light = false }) {
  const { key, setKey } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Change theme" title="Theme" className={light ? '' : 'nav-btn'}
        style={light ? { ...NAV_ICON_BTN, background: C.glassHi, border: `1px solid ${C.border2}`, color: C.navy, boxShadow: '0 2px 8px rgba(16,24,40,0.08)' } : NAV_ICON_BTN}>
        <PaletteIcon />
      </button>
      {open && (
        <div className="slideDown" style={{
          position: 'absolute', top: 44, right: 0, width: 220, background: C.glassPop, backdropFilter: 'blur(22px) saturate(170%)', WebkitBackdropFilter: 'blur(22px) saturate(170%)', borderRadius: 14,
          border: `1px solid ${C.border}`, boxShadow: '0 16px 40px rgba(16,24,40,0.18)', zIndex: 500, padding: 6
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: C.muted, padding: '8px 10px 6px' }}>Theme</div>
          {Object.entries(THEMES).map(([k, t]) => (
            <button key={k} onClick={() => { setKey(k); setOpen(false); }} className="menu-item"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8,
                border: 'none', background: key === k ? C.goldL : 'transparent', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, color: C.text, fontWeight: key === k ? 600 : 500
              }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg,${t.navy2},${t.gold2})`, border: '2px solid #fff', boxShadow: `0 0 0 1px ${t.navy}55`
              }} />
              <span style={{ flex: 1 }}>{t.label}</span>
              {key === k && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopBar({ subtitle, roleLabel, user, onLogout, tabs, activeTab, onTabChange, tabBadges = {}, maxWidth = 1100, extraActions = null }) {
  const barRef = useRef(null);
  // Publish the navbar height so dialogs and the assistant can sit just below it.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return undefined;
    const apply = () => { const h = el.offsetHeight; if (h) document.documentElement.style.setProperty('--nav-h', `${h}px`); };
    apply();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(apply); ro.observe(el); }
    window.addEventListener('resize', apply);
    return () => { window.removeEventListener('resize', apply); if (ro) ro.disconnect(); };
  }, []);
  return (
    <div ref={barRef} id="idar-topbar" style={{ position: 'sticky', top: 0, zIndex: 1100, boxShadow: '0 10px 34px rgba(16,24,40,0.20)' }}>
      <div style={{
        background: `linear-gradient(100deg,${C.navy2}f5,${C.navy3}f2)`, backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(255,255,255,0.10)', position: 'relative', zIndex: 3
      }}>
        <div style={{
          maxWidth, margin: '0 auto', padding: '10px 16px', minHeight: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', rowGap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.6)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
            }}>
              <img src={chrclogo} alt="Logo" style={{ width: 27, height: 27, objectFit: 'contain' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display','Poppins',serif", fontWeight: 700, letterSpacing: .3, fontSize: 16.5, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '52vw' }}>
                CHRC IDAR Ticket System
              </div>
              <div className="hide-sm" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{subtitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', rowGap: 8 }}>
            {extraActions}
            <ThemeMenu />
            <div className="hide-sm" style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 99, padding: '3px 14px 3px 3px'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: C.navy,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700
              }}>{(user.displayName || '?').charAt(0).toUpperCase()}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user.displayName}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)' }}>{roleLabel}</div>
              </div>
            </div>
            <Btn onClick={onLogout} variant="ghost" size="sm"
              style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}>Logout</Btn>
          </div>
        </div>
      </div>
      {tabs && (
        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.58)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(255,255,255,0.7)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}>
          <div style={{ maxWidth, margin: '0 auto', padding: '0 12px', display: 'flex', gap: 2, overflowX: 'auto' }}>
            {tabs.map(([k, l]) => (
              <button key={k} onClick={() => onTabChange(k)} className="tab-btn"
                style={{
                  padding: '12px 18px', background: activeTab === k ? 'rgba(255,255,255,0.7)' : 'none', borderRadius: '12px 12px 0 0', border: 'none', whiteSpace: 'nowrap',
                  borderBottom: `2.5px solid ${activeTab === k ? C.gold : 'transparent'}`,
                  color: activeTab === k ? C.navy : C.muted,
                  fontWeight: activeTab === k ? 600 : 500, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s'
                }}>
                {l}
                {tabBadges[k] > 0 && (
                  <span style={{
                    background: C.goldL, color: C.navy, borderRadius: 99, border: `1px solid ${C.border}`,
                    fontSize: 10.5, padding: '1px 7px', marginLeft: 6, fontWeight: 600
                  }}>{tabBadges[k]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Glass multi-select dropdown (checkbox list, search, select-all / clear).
// The list is rendered through a portal with fixed positioning, so it can never be clipped or hidden by a card.
function MultiSelect({ options, value, onChange, placeholder = 'All', style = {}, searchable }) {
  const opts = useMemo(() => options.map(o => (typeof o === 'string' ? { value: o, label: o } : o)), [options]);
  const sel = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const showSearch = searchable === undefined ? opts.length > 8 : searchable;

  const place = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.max(r.width, 270);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    const below = window.innerHeight - r.bottom - 14;
    if (below < 200 && r.top > below) setPos({ left, width: w, bottom: window.innerHeight - r.top + 6, maxH: Math.min(380, r.top - 14) });
    else setPos({ left, width: w, top: r.bottom + 6, maxH: Math.max(200, Math.min(380, below)) });
  };

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onDown = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (popRef.current && popRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onMove = (e) => { if (popRef.current && popRef.current.contains(e.target)) return; place(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = q ? opts.filter(o => safeLC(o.label).includes(q.toLowerCase())) : opts;
  const toggle = (v) => onChange(sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]);
  const selectShown = () => onChange(Array.from(new Set([...sel, ...shown.map(o => o.value)])));
  const labelOf = (v) => (opts.find(o => o.value === v) || { label: v }).label;
  const has = sel.length > 0;

  return (
    <>
      <button type="button" ref={btnRef} onClick={() => { setOpen(o => !o); setQ(''); }}
        style={{
          ...inputStyle, ...style, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer',
          border: `1px solid ${has ? C.gold : C.border2}`, background: has ? `${C.gold}18` : C.field,
          color: has ? C.navy : C.text2, fontWeight: has ? 600 : 400
        }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {!has ? placeholder : sel.length === 1 ? labelOf(sel[0]) : labelOf(sel[0])}
        </span>
        {sel.length > 1 && (
          <span style={{ background: C.navy, color: '#fff', borderRadius: 99, fontSize: 10.5, fontWeight: 700, padding: '1px 7px', flexShrink: 0 }}>+{sel.length - 1}</span>
        )}
        <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && pos && createPortal(
        <div ref={popRef} className="slideDown" style={{
          position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, zIndex: 1300,
          background: C.glassPop, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.9)', borderRadius: 16, boxShadow: '0 24px 60px rgba(16,24,40,0.28), inset 0 1px 0 #fff',
          display: 'flex', flexDirection: 'column', maxHeight: pos.maxH, overflow: 'hidden'
        }}>
          <div style={{ padding: '10px 10px 8px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {showSearch && (
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
                style={{ ...inputStyle, height: 34, fontSize: 12.5, padding: '6px 12px' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{sel.length} selected</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={selectShown} style={{ fontSize: 11.5, fontWeight: 600, color: C.navy, background: C.goldL, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}>Select all</button>
                <button type="button" onClick={() => onChange([])} style={{ fontSize: 11.5, fontWeight: 600, color: C.red, background: C.redL, border: `1px solid ${C.red}33`, borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: 6, flex: 1 }}>
            {shown.length === 0 && <div style={{ padding: 14, textAlign: 'center', fontSize: 12.5, color: C.muted }}>No match</div>}
            {shown.map(o => {
              const on = sel.includes(o.value);
              return (
                <div key={o.value} onClick={() => toggle(o.value)} className="menu-item"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: C.text, background: on ? `${C.gold}1c` : 'transparent', fontWeight: on ? 600 : 400 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${on ? C.navy : C.border2}`, background: on ? C.navy : '#fff', color: '#fff', fontSize: 12, lineHeight: 1
                  }}>{on ? '✓' : ''}</span>
                  <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{o.label}</span>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Shared layout for the full-screen ticket window (employee + admin + technician).
function SectionCard({ title, children, style = {} }) {
  return (
    <Card style={{ padding: 18, marginBottom: 14, ...style }}>
      {title && (
        <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      )}
      {children}
    </Card>
  );
}

function TicketDetailView({ ticket: t, viewer, mainExtra = null, sideActions = null }) {
  const done = t.status === 'resolved' || t.status === 'closed';
  const sla = slaState(t, Date.now());
  const info = [
    ['Ticket ID', t.id, true],
    ['Category', typeKey(t.type)],
    ['Department / Location', t.dept],
    ['Raised By', t.userName],
    ['Employee ID', t.empId],
    ['Raised On', t.at ? fmtDT(t.at) : ''],
    ['Assigned Technician', t.assignedToName],
    ['Allocated By', t.assignedByName],
    ['Allocated On', t.assignedAt ? fmtDT(t.assignedAt) : ''],
    ['Resolved By', done ? t.actionBy : ''],
    ['Resolved On', done && t.actionAt ? fmtDT(t.actionAt) : ''],
    ['Time Taken', done && t.actionAt ? getDuration(t.at, t.actionAt) : '']
  ];
  const showNote = t.status === 'hold' && t.holdReason && !/^Allocated/.test(t.holdReason);
  const text = { fontSize: 13.5, color: C.text2, lineHeight: 1.65, wordBreak: 'break-word', whiteSpace: 'pre-wrap' };
  return (
    <div className="detail-grid">
      <div style={{ minWidth: 0 }}>
        <Card style={{ padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <Badge status={t.status} />
            <PriorityBadge priority={t.priority} />
            {sla && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#9a5b0b', background: 'rgba(217,119,6,0.10)', padding: '3px 10px', borderRadius: 99 }}>
                No update for {fmtSpan(sla.idle)}
              </span>
            )}
          </div>
          <TicketStepper c={t} />
        </Card>
        <SectionCard title="Issue Description"><div style={text}>{na(t.desc)}</div></SectionCard>
        {showNote && <SectionCard title="Latest Update"><div style={text}>{t.holdReason}</div></SectionCard>}
        {t.status === 'refused' && <SectionCard title="Reason for Refusal"><div style={text}>{na(t.refuseReason)}</div></SectionCard>}
        {t.solution && <SectionCard title="Action Taken"><div style={text}>{t.solution}</div></SectionCard>}
        {mainExtra}
        {viewer !== 'employee' && t.assignHistory && t.assignHistory.length > 0 && (
          <SectionCard title="Allocation History">
            <div style={{ ...text, whiteSpace: 'normal' }}>
              <div>1. Raised by <strong>{t.userName}</strong> on {fmtDT(t.at)}</div>
              {t.assignHistory.map((h, i) => (
                <div key={i}>{i + 2}. <strong>{h.byName || h.by}</strong> allocated to <strong>{h.toName || h.to}</strong> on {fmtDT(h.at)}{h.note ? ` (${h.note})` : ''}</div>
              ))}
            </div>
          </SectionCard>
        )}
        <SectionCard title="Status Timeline"><Timeline history={t.history} /></SectionCard>
      </div>
      <div className="detail-side" style={{ minWidth: 0 }}>
        <SectionCard title="Ticket Details">
          {info.map(([k, v, mono], i) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', gap: 14, padding: '8px 0',
              borderBottom: i === info.length - 1 ? 'none' : `1px solid ${C.border}`
            }}>
              <span style={{ fontSize: 12.5, color: C.muted, flexShrink: 0 }}>{k}</span>
              <span style={{
                fontSize: 13, fontWeight: 600, color: na(v) === 'N/A' ? C.muted : C.text, textAlign: 'right', wordBreak: 'break-word',
                fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit'
              }}>{na(v)}</span>
            </div>
          ))}
        </SectionCard>
        {sideActions && <SectionCard title="Actions"><div className="action-grid">{sideActions}</div></SectionCard>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TICKET ASSISTANT — live tracking for active tickets only
//  - Open by default, narrates progress as automated messages
//  - Employee sees head / technician actions on their own ticket
//  - Technician sees the head's instructions, head sees technician updates
//  - Reminds technician / head when an active ticket goes quiet (SLA_HOURS)
//  - Resolved or closed tickets drop out; a new complaint starts a fresh feed
// ══════════════════════════════════════════════════════════════
const inferActorRole = (h, c) => {
  if (h.role) return h.role;
  if (h.kind === 'allocation') return 'head';
  if (c.assignedToName && h.actionBy && h.actionBy === c.assignedToName) return 'technician';
  return 'admin';
};

const isActiveTicket = (c) => c && (c.status === 'open' || c.status === 'hold');

const assistantText = (viewer, c, h, i, prev, meName) => {
  const id = c.id;
  const actor = h.actionBy || 'The support team';
  const role = inferActorRole(h, c);
  const detail = (h.detail || '').trim();
  const mine = viewer !== 'employee' && h.actionBy && meName && h.actionBy === meName;
  const who = role === 'technician' ? `Technician ${actor}` : actor;

  if (i === 0) {
    if (viewer === 'employee') return `Your ticket ${id} (${typeKey(c.type)}) has been registered. It will be reviewed and allocated shortly.`;
    if (viewer === 'head') return `New ticket ${id} from ${c.userName}, ${c.dept} (${typeKey(c.type)}). Awaiting allocation.`;
    return null;
  }
  if (h.kind === 'allocation') {
    const tech = h.techName || c.assignedToName || 'a technician';
    const ins = (h.instruction || '').trim();
    if (viewer === 'employee') return `${actor} has allocated ticket ${id} to technician ${tech}.${ins ? ` Instruction given: "${ins}"` : ''}`;
    if (viewer === 'technician') return `${actor} allocated ticket ${id} to you (${typeKey(c.type)}, ${c.dept}).${ins ? ` Instruction: "${ins}"` : ' No additional instructions.'}`;
    return null;
  }
  if (h.status === 'hold') {
    const txt = detail || h.note || 'Work is in progress.';
    if (mine) return null;
    if (viewer === 'employee') return `${who} posted an update on ${id}: ${txt}`;
    if (viewer === 'head') return role === 'technician' ? `${who} posted an update on ${id}: ${txt}` : null;
    return role !== 'technician' ? `${actor} updated ${id}: ${txt}` : null;
  }
  return null;
};

const finalText = (viewer, c) => {
  const id = c.id;
  if (c.status === 'refused') {
    const why = (c.refuseReason || '').trim();
    return viewer === 'employee'
      ? `Ticket ${id} could not be taken forward.${why ? ` Reason: ${why}` : ''}`
      : `Ticket ${id} was refused.${why ? ` Reason: ${why}` : ''}`;
  }
  const by = (c.actionBy || '').trim();
  const sol = (c.solution || '').trim();
  return viewer === 'employee'
    ? `Ticket ${id} has been resolved${by ? ` by ${by}` : ''}.${sol ? ` Action taken: ${sol}` : ''}`
    : `Ticket ${id} (${c.dept}) has been resolved${by ? ` by ${by}` : ''}.`;
};

const slaText = (viewer, c, sla) => {
  const span = fmtSpan(sla.idle);
  if (viewer === 'employee') {
    return c.assignedToName
      ? `Ticket ${c.id} is taking longer than expected (no update for ${span}). It is with technician ${c.assignedToName}; the technician and department head have been reminded.`
      : `Ticket ${c.id} is taking longer than expected (no update for ${span}). The department head has been reminded.`;
  }
  if (viewer === 'technician') return `Reminder: ticket ${c.id} (${c.dept}) has had no update for ${span}. Please post an update or resolve it.`;
  return c.assignedToName
    ? `Technician ${c.assignedToName} has not updated ticket ${c.id} for ${span}. Please follow up.`
    : `Ticket ${c.id} (${typeKey(c.type)}, ${c.dept}) has been waiting for allocation for ${span}.`;
};

const buildAssistantEvents = (tickets, viewer, meName, nowMs) => {
  const out = [];
  (tickets || []).filter(isActiveTicket).forEach(c => {
    const hist = c.history || [];
    hist.forEach((h, i) => {
      const text = assistantText(viewer, c, h, i, hist[i - 1], meName);
      if (text) out.push({ key: `${c._docId || c.id}:${i}`, at: h.at, ticketId: c.id, text, kind: h.kind === 'allocation' ? 'allocation' : (i === 0 ? 'new' : 'update') });
    });
    const sla = slaState(c, nowMs);
    if (sla) {
      const at = new Date(new Date(lastActivityAt(c)).getTime() + sla.n * sla.limit).toISOString();
      out.push({ key: `sla:${c._docId || c.id}:${sla.n}`, at, ticketId: c.id, text: slaText(viewer, c, sla), kind: 'alert' });
    }
  });
  return out.sort((a, b) => new Date(a.at) - new Date(b.at));
};

const ASSISTANT_KIND = {
  new: { label: 'New ticket', color: '#2563eb' },
  allocation: { label: 'Allocation', color: '#7c3aed' },
  update: { label: 'Update', color: '#0f766e' },
  alert: { label: 'Reminder', color: '#c2410c' },
  final: { label: 'Completed', color: '#15803d' },
};

function AssistantAvatar({ size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, position: 'relative',
      background: `linear-gradient(135deg,${C.navy},${C.navy3})`, color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, letterSpacing: .4, boxShadow: `0 2px 8px ${C.navy}44`
    }}>AI</div>
  );
}

const dayLabel = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const clockLabel = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const ASSISTANT_DOCK_MIN = 1500;

function TicketAssistant({ tickets, viewer, me }) {
  const nowMs = useNowTick(60000);
  const events = useMemo(() => buildAssistantEvents(tickets, viewer, me.displayName, nowMs), [tickets, viewer, me.displayName, nowMs]);
  const activeTickets = useMemo(() => (tickets || []).filter(isActiveTicket), [tickets]);
  const activeCount = activeTickets.length;
  const [open, setOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= ASSISTANT_DOCK_MIN));
  const [unread, setUnread] = useState(0);
  const [pending, setPending] = useState([]);
  const [finals, setFinals] = useState([]);
  const [live, setLive] = useState(null);
  const [focus, setFocus] = useState('');
  const knownRef = useRef(null);
  const statusRef = useRef(null);
  const queueRef = useRef([]);
  const busyRef = useRef(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const openRef = useRef(open);
  const listRef = useRef(null);
  const liveShown = live ? live.shown : -1;
  const livePhase = live ? live.phase : '';

  useEffect(() => { openRef.current = open; if (open) setUnread(0); }, [open]);

  // On wide screens the assistant docks beside the page and the page content makes room for it.
  useEffect(() => {
    const apply = () => document.body.classList.toggle('assistant-docked', open && window.innerWidth >= ASSISTANT_DOCK_MIN);
    apply();
    window.addEventListener('resize', apply);
    return () => { window.removeEventListener('resize', apply); document.body.classList.remove('assistant-docked'); };
  }, [open]);

  function runNext() {
    if (!mountedRef.current) return;
    const next = queueRef.current.shift();
    if (!next) { busyRef.current = false; setLive(null); return; }
    busyRef.current = true;
    setLive({ ...next, phase: 'typing', shown: 0 });
    const typingMs = 800 + Math.min(next.text.length * 6, 700);
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      let shown = 0;
      setLive(l => (l ? { ...l, phase: 'writing' } : l));
      const tick = () => {
        if (!mountedRef.current) return;
        shown += 2;
        if (shown >= next.text.length) {
          setLive(null);
          setPending(p => p.filter(k => k !== next.key));
          timerRef.current = setTimeout(runNext, 400);
          return;
        }
        setLive(l => (l ? { ...l, shown } : l));
        timerRef.current = setTimeout(tick, 16);
      };
      tick();
    }, typingMs);
  }

  useEffect(() => {
    mountedRef.current = true;
    // Tickets load asynchronously: whatever exists when the first data arrives is the
    // baseline (shown instantly); only changes after that are typed out live.
    const settle = setTimeout(() => { if (knownRef.current === null) knownRef.current = new Set(); }, 2500);
    return () => { mountedRef.current = false; clearTimeout(timerRef.current); clearTimeout(settle); };
  }, []);

  // When an active ticket completes the assistant shows one closing message and drops the
  // older ones. A brand-new complaint starts a fresh feed.
  useEffect(() => {
    const list = tickets || [];
    const cur = {};
    list.forEach(c => { cur[c._docId || c.id] = c.status; });
    if (statusRef.current === null) {
      if (list.length > 0) statusRef.current = cur;
      return;
    }
    const prev = statusRef.current;
    statusRef.current = cur;
    const was = (c) => prev[c._docId || c.id];
    const done = list.filter(c => (was(c) === 'open' || was(c) === 'hold') && (c.status === 'resolved' || c.status === 'closed' || c.status === 'refused'));
    const created = list.filter(c => was(c) === undefined && isActiveTicket(c));
    if (created.length > 0) setFinals([]);
    if (done.length > 0) {
      const fresh = done.map(c => ({
        key: `final:${c._docId || c.id}`, at: c.actionAt || new Date().toISOString(),
        ticketId: c.id, text: finalText(viewer, c), kind: 'final'
      }));
      if (openRef.current) {
        queueRef.current.push(...fresh);
        setPending(p => [...p, ...fresh.map(e => e.key)]);
        setFinals(f => [...f.filter(x => !fresh.some(y => y.key === x.key)), ...fresh]);
        if (!busyRef.current) runNext();
      } else {
        setFinals(f => [...f, ...fresh]);
        setUnread(u => u + fresh.length);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, viewer]);

  useEffect(() => {
    if (knownRef.current === null) {
      if (events.length > 0) knownRef.current = new Set(events.map(e => e.key));
      return;
    }
    const fresh = events.filter(e => !knownRef.current.has(e.key));
    if (fresh.length === 0) return;
    fresh.forEach(e => knownRef.current.add(e.key));
    if (!openRef.current) { setUnread(u => u + fresh.length); return; }
    if (fresh.length > 3) return;
    queueRef.current.push(...fresh);
    setPending(p => [...p, ...fresh.map(e => e.key)]);
    if (!busyRef.current) runNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, events.length, finals.length, pending.length, liveShown, livePhase, focus]);

  // If the focused ticket is no longer active, go back to showing everything.
  useEffect(() => {
    if (focus && !activeTickets.some(c => c.id === focus) && !finals.some(f => f.ticketId === focus)) setFocus('');
  }, [focus, activeTickets, finals]);

  const feed = [...events, ...finals]
    .filter(e => !pending.includes(e.key))
    .filter(e => !focus || e.ticketId === focus)
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .slice(-60);
  const roleTitle = viewer === 'employee' ? 'Live tracking of your tickets' : viewer === 'technician' ? 'Instructions and reminders' : 'Technician activity and reminders';

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Open ticket assistant" title="Ticket Assistant" className="nav-btn"
        style={{
          position: 'fixed', right: 18, bottom: 18, zIndex: 1150, width: 54, height: 54, borderRadius: '50%',
          background: `linear-gradient(135deg,${C.navy},${C.navy3})`, color: '#fff', border: '2px solid rgba(255,255,255,0.7)', cursor: 'pointer',
          boxShadow: `0 10px 26px ${C.navy}66`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: C.red, color: '#fff', borderRadius: 99,
            fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px', border: '2px solid #fff'
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
    );
  }

  const kindOf = (k) => ASSISTANT_KIND[k] || ASSISTANT_KIND.update;
  const bubble = (kind) => ({
    background: C.glassHi, border: `1px solid ${C.border}`, boxShadow: `inset 3px 0 0 ${kindOf(kind).color}, 0 1px 2px rgba(16,24,40,0.05)`,
    borderRadius: '4px 16px 16px 16px', padding: '10px 14px', fontSize: 12.5, lineHeight: 1.6, color: C.text2, wordBreak: 'break-word'
  });
  const tag = (e, typing) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4, fontSize: 10.5, color: C.muted }}>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.navy, fontWeight: 700, background: C.goldL, borderRadius: 6, padding: '1px 7px' }}>{e.ticketId}</span>
      <span style={{ color: kindOf(e.kind).color, fontWeight: 700 }}>{kindOf(e.kind).label}</span>
      {typing && <span>typing...</span>}
    </div>
  );
  const rows = [];
  let lastDay = '';
  feed.forEach(e => {
    const d = dayLabel(e.at);
    if (d && d !== lastDay) { rows.push({ sep: d, key: `sep:${d}:${e.key}` }); lastDay = d; }
    rows.push(e);
  });

  return (
    <div className="assistant-panel" style={{
      position: 'fixed', right: 14, bottom: 14, top: 'calc(var(--nav-h, 112px) + 14px)', zIndex: 1150, width: 320, maxWidth: 'calc(100vw - 20px)',
      background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      border: `1px solid ${C.border2}`, borderRadius: 20, boxShadow: '0 20px 54px rgba(16,24,40,0.2)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px 13px 16px', background: `linear-gradient(100deg,${C.navy2},${C.navy3})`, color: '#fff' }}>
        <div style={{ position: 'relative' }}>
          <AssistantAvatar size={38} />
          <span className="pulse" style={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%', background: '#4ade80', border: '2px solid #fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>Ticket Assistant</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.82)' }}>Online &middot; {roleTitle}</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Minimise assistant" className="nav-btn"
          style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 17, lineHeight: 1 }}>&minus;</button>
      </div>
      {activeCount > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '9px 12px', overflowX: 'auto', borderBottom: `1px solid ${C.border}`, background: C.glassHi, flexShrink: 0 }}>
          {[['', `All (${activeCount})`], ...activeTickets.map(c => [c.id, c.id])].map(([k, label], ci) => (
            <button key={`${k || 'all'}-${ci}`} onClick={() => setFocus(k)}
              style={{
                flexShrink: 0, padding: '4px 11px', borderRadius: 99, fontSize: 11.5, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: k ? "'JetBrains Mono',monospace" : 'inherit', fontWeight: focus === k ? 700 : 500,
                border: `1px solid ${focus === k ? C.navy : C.border2}`, background: focus === k ? C.goldL : C.glassHi, color: focus === k ? C.navy : C.text2
              }}>{label}</button>
          ))}
        </div>
      )}
      <div ref={listRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, background: C.inset, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.length === 0 && !live && (
          <div style={{ margin: 'auto', textAlign: 'center', color: C.muted, fontSize: 12.5, padding: 20, lineHeight: 1.7 }}>
            <AssistantAvatar size={44} />
            <div style={{ marginTop: 12 }}>No active tickets.<br />Progress on a new complaint appears here automatically.</div>
          </div>
        )}
        {rows.map(e => e.sep ? (
          <div key={e.key} style={{ alignSelf: 'center', fontSize: 10.5, fontWeight: 600, color: C.muted, background: C.glassHi, border: `1px solid ${C.border}`, borderRadius: 99, padding: '2px 12px' }}>{e.sep}</div>
        ) : (
          <div key={e.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '96%' }}>
            <AssistantAvatar size={26} />
            <div style={{ minWidth: 0 }}>
              {tag(e, false)}
              <div style={bubble(e.kind)}>{e.text}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3, marginLeft: 4 }}>{clockLabel(e.at)}</div>
            </div>
          </div>
        ))}
        {live && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '96%' }}>
            <AssistantAvatar size={26} />
            <div style={{ minWidth: 0 }}>
              {tag(live, live.phase === 'typing')}
              <div style={bubble(live.kind)}>
                {live.phase === 'typing' ? (
                  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 18 }}>
                    {[0, 1, 2].map(n => (
                      <span key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: C.muted, animation: `typingDot 1.1s ${n * 0.16}s infinite ease-in-out` }} />
                    ))}
                  </span>
                ) : live.text.slice(0, live.shown)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, background: C.glassHi, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: C.inset, border: `1px solid ${C.border}`,
          borderRadius: 99, padding: '8px 14px', fontSize: 11.5, color: C.muted
        }}>
          <span>Tracking {activeCount} active ticket{activeCount === 1 ? '' : 's'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />Live</span>
        </div>
      </div>
    </div>
  );
}

// ── TOASTS (short success / error confirmations) ──────────────
const toastBus = { listeners: new Set(), push(t) { this.listeners.forEach(l => l(t)); } };
const toast = {
  success: (msg, ms = 4000) => toastBus.push({ kind: 'success', msg, ms }),
  error: (msg, ms = 5000) => toastBus.push({ kind: 'error', msg, ms }),
};

function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (t) => {
      const id = `${Date.now()}-${Math.random()}`;
      setItems(list => [...list, { ...t, id }].slice(-3));
      setTimeout(() => setItems(list => list.filter(x => x.id !== id)), t.ms);
    };
    toastBus.listeners.add(on);
    return () => { toastBus.listeners.delete(on); };
  }, []);
  if (items.length === 0) return null;
  return (
    <div style={{
      position: 'fixed', top: 'calc(var(--nav-h, 0px) + 14px)', left: 0, right: 0, zIndex: 1400,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', padding: '0 12px'
    }}>
      {items.map(t => {
        const ok = t.kind === 'success';
        const col = ok ? '#15803d' : '#b42318';
        return (
          <div key={t.id} role="status" className="toast-in" style={{
            display: 'flex', alignItems: 'center', gap: 12, minWidth: 260, maxWidth: 520, padding: '12px 18px 12px 14px',
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            border: `1px solid ${col}33`, borderRadius: 14, boxShadow: '0 14px 40px rgba(16,24,40,0.18)', pointerEvents: 'auto'
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: '50%', background: `${col}18`, color: col, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {ok ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path className="toast-check" d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 7v6M12 17h.01" /></svg>
              )}
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// Password-style input that does not trigger the browser's password manager /
// "found in a data breach" pop-up (text input masked with CSS where supported).
const SUPPORTS_TEXT_SECURITY = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('-webkit-text-security', 'disc');
function SecretInput({ show = false, style, ...rest }) {
  if (SUPPORTS_TEXT_SECURITY) {
    return (
      <input {...rest} type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        data-lpignore="true" data-1p-ignore="true" data-form-type="other"
        style={{ ...style, WebkitTextSecurity: show ? 'none' : 'disc' }} />
    );
  }
  return <input {...rest} type={show ? 'text' : 'password'} autoComplete="new-password" style={style} />;
}

// ══════════════════════════════════════════════════════════════
//  AI HELPERS — rule-based automation that runs fully in the browser
//  (no external service, no API key, nothing leaves the hospital network)
// ══════════════════════════════════════════════════════════════
const AI_CATEGORY_RULES = [
  ['Suvarna', ['suvarna']],
  ['Network', ['internet', 'wifi', 'wi-fi', 'lan', 'network', 'router', 'switch', 'ethernet', 'ip address', 'connectivity', 'vpn', 'lan cable', 'no connection']],
  ['Printer', ['printer', 'printing', 'print', 'toner', 'cartridge', 'scanner', 'scan', 'paper jam', 'xerox']],
  ['IT Hardware', ['computer', 'pc', 'cpu', 'monitor', 'keyboard', 'mouse', 'system', 'laptop', 'ups', 'hdd', 'ram', 'screen', 'display', 'not turning on', 'hang', 'hanging', 'restart']],
  ['Other Software', ['software', 'app', 'application', 'login', 'password', 'his', 'hms', 'lis', 'pacs', 'email', 'outlook', 'windows', 'error', 'install', 'license', 'server', 'report not', 'page not opening']],
  ['Electrical', ['electric', 'electrical', 'light', 'tube', 'bulb', 'fan', 'socket', 'switch board', 'mcb', 'short circuit', 'spark', 'wiring', 'power', 'plug', 'voltage', 'tripping']],
  ['AC', ['ac', 'a.c', 'air conditioner', 'not cooling', 'split ac', 'cooling']],
  ['Air Cooler', ['air cooler']],
  ['Water Cooler', ['water cooler']],
  ['RO', ['ro', 'water purifier', 'purifier']],
  ['Fridge/Freezer', ['fridge', 'refrigerator', 'freezer', 'deep freezer']],
  ['Plumber', ['leak', 'leakage', 'tap', 'pipe', 'flush', 'toilet', 'drain', 'water supply', 'basin', 'seepage', 'overflow']],
  ['Biomedical Equipment', ['ventilator', 'infusion pump', 'syringe pump', 'ecg', 'defibrillator', 'nebuliser', 'nebulizer', 'suction', 'oxygen concentrator', 'biomedical', 'bp apparatus', 'pulse oximeter', 'patient monitor']],
  ['Furniture Repairing', ['chair', 'table', 'bed', 'cot', 'almirah', 'cupboard', 'drawer', 'locker', 'trolley', 'furniture']],
  ['Carpenter', ['door', 'window', 'lock', 'hinge', 'wood', 'shelf']],
  ['Painter', ['paint', 'whitewash', 'putty', 'wall colour', 'wall color']],
  ['Welding', ['weld', 'grill', 'railing', 'gate']],
  ['Gas Plant/Cylinder', ['gas', 'cylinder', 'manifold', 'regulator']],
  ['Mobile/Charger', ['mobile', 'charger', 'phone']],
];
const AI_HIGH_WORDS = ['urgent', 'emergency', 'asap', 'immediately', 'icu', 'nicu', 'ot', 'operation theatre', 'operation theater', 'casualty', 'critical', 'dialysis', 'ventilator', 'not working at all', 'completely down', 'dead', 'fire', 'smoke', 'spark', 'short circuit', 'flood', 'overflow'];
const AI_LOW_WORDS = ['minor', 'whenever', 'when possible', 'no hurry', 'cosmetic', 'suggestion', 'shifting', 'later'];

const aiRegexCache = {};
const aiHas = (text, word) => {
  const key = word;
  if (!aiRegexCache[key]) aiRegexCache[key] = new RegExp(`(^|[^a-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
  return aiRegexCache[key].test(text);
};

// Reads the complaint text and suggests a category and priority.
const aiClassify = (text) => {
  const t = String(text || '').toLowerCase();
  if (t.trim().length < 8) return null;
  let best = null;
  AI_CATEGORY_RULES.forEach(([type, words]) => {
    if (!COMPLAINT_TYPES.includes(type)) return;
    const hits = words.filter(w => aiHas(t, w)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { type, hits };
  });
  const high = AI_HIGH_WORDS.some(w => aiHas(t, w));
  const low = !high && AI_LOW_WORDS.some(w => aiHas(t, w));
  const priority = high ? 'high' : low ? 'low' : DEFAULT_PRIORITY;
  if (!best && priority === DEFAULT_PRIORITY) return null;
  return { type: best ? best.type : '', priority };
};

// Picks the technician best placed to take a ticket: fewest open tickets, most
// similar tickets already resolved.
const recommendTechnician = (techs, complaints, ticket) => {
  if (!techs || techs.length === 0) return null;
  const rows = techs.map(t => {
    const mine = complaints.filter(c => safeLC(c.assignedTo) === safeLC(t.username));
    const active = mine.filter(isActiveTicket).length;
    const similar = mine.filter(c => (c.status === 'closed' || c.status === 'resolved') && typeKey(c.type) === typeKey(ticket.type)).length;
    return { tech: t, active, similar, score: similar * 1.5 - active * 2 };
  }).sort((a, b) => b.score - a.score || a.active - b.active);
  return rows[0];
};

const DEFAULT_SOLUTIONS = {
  'Network': ['Replaced the faulty LAN cable', 'Reset the switch port and restored connectivity', 'Corrected the IP configuration'],
  'IT Hardware': ['Restarted and tested the system', 'Replaced the keyboard / mouse', 'Cleaned and reseated the hardware parts'],
  'Printer': ['Cleared the paper jam', 'Replaced the toner cartridge', 'Reinstalled the printer driver'],
  'Electrical': ['Replaced the faulty bulb / tube', 'Repaired the loose wiring', 'Replaced the MCB / switch'],
  'Plumber': ['Fixed the leakage', 'Cleared the drain blockage', 'Replaced the tap / washer'],
  'AC': ['Cleaned the filters and checked the gas', 'Replaced the capacitor', 'Reset the unit and tested cooling'],
};
const GENERIC_SOLUTIONS = ['Issue fixed on site', 'Faulty part replaced', 'Checked and working normally'];

// Most common past solutions for the same category, then sensible defaults.
const suggestSolutions = (complaints, ticket) => {
  const counts = {};
  complaints.forEach(c => {
    if (!(c.status === 'closed' || c.status === 'resolved') || typeKey(c.type) !== typeKey(ticket.type)) return;
    const s = String(c.solution || '').trim();
    if (s.length < 4 || s.length > 90) return;
    const k = s.toLowerCase();
    counts[k] = counts[k] || { text: s, n: 0 };
    counts[k].n++;
  });
  const learned = Object.values(counts).sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.text);
  const defaults = DEFAULT_SOLUTIONS[typeKey(ticket.type)] || GENERIC_SOLUTIONS;
  const out = [...learned];
  defaults.forEach(d => { if (out.length < 5 && !out.some(x => x.toLowerCase() === d.toLowerCase())) out.push(d); });
  return out;
};

// Plain-language observations generated from the live ticket data.
const buildInsights = (rows, techs, nowMs) => {
  const out = [];
  const n = rows.length;
  if (n === 0) return [{ tone: 'info', title: 'Not enough data yet', text: 'Insights appear once tickets are raised.' }];
  const by = (fn) => { const m = {}; rows.forEach(c => { const k = fn(c) || 'N/A'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const isDoneT = (c) => c.status === 'resolved' || c.status === 'closed';

  const cats = by(c => typeKey(c.type));
  if (cats[0]) out.push({ tone: 'info', title: 'Most frequent category', text: `${cats[0][0]} makes up ${Math.round((cats[0][1] / n) * 100)}% of tickets (${cats[0][1]} of ${n}). A preventive check on this area can reduce repeat complaints.` });
  const depts = by(c => c.dept);
  if (depts[0] && depts[0][1] >= 2) out.push({ tone: 'info', title: 'Busiest location', text: `${depts[0][0]} has raised the most tickets (${depts[0][1]}).` });

  const monthAgo = nowMs - 30 * 86400000;
  const repeat = {};
  rows.filter(c => new Date(c.at).getTime() >= monthAgo).forEach(c => { const k = `${typeKey(c.type)}|${c.dept}`; repeat[k] = (repeat[k] || 0) + 1; });
  const rep = Object.entries(repeat).filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1])[0];
  if (rep) { const [type, dept] = rep[0].split('|'); out.push({ tone: 'warn', title: 'Repeated issue', text: `${type} at ${dept} was raised ${rep[1]} times in the last 30 days. A root-cause check is recommended.` }); }

  const active = rows.filter(isActiveTicket);
  const overdue = active.filter(c => slaState(c, nowMs));
  if (overdue.length) out.push({ tone: 'warn', title: 'Overdue tickets', text: `${overdue.length} active ticket${overdue.length === 1 ? ' has' : 's have'} had no update past the allowed time (${overdue.slice(0, 3).map(c => c.id).join(', ')}${overdue.length > 3 ? ', ...' : ''}).` });
  const unassigned = active.filter(c => !c.assignedTo);
  if (unassigned.length) out.push({ tone: 'warn', title: 'Waiting for allocation', text: `${unassigned.length} active ticket${unassigned.length === 1 ? ' is' : 's are'} not yet assigned to a technician.` });

  if (techs && techs.length > 1) {
    const load = techs.map(t => ({ name: t.displayName, n: active.filter(c => safeLC(c.assignedTo) === safeLC(t.username)).length })).sort((a, b) => b.n - a.n);
    if (load[0].n - load[load.length - 1].n >= 3) out.push({ tone: 'warn', title: 'Uneven workload', text: `${load[0].name} has ${load[0].n} active tickets while ${load[load.length - 1].name} has ${load[load.length - 1].n}. Consider rebalancing.` });
  }

  const doneRows = rows.filter(c => isDoneT(c) && c.actionAt && c.at);
  if (doneRows.length >= 2) {
    const m = {};
    doneRows.forEach(c => { const k = typeKey(c.type); (m[k] = m[k] || []).push(new Date(c.actionAt) - new Date(c.at)); });
    const slow = Object.entries(m).filter(([, v]) => v.length >= 2).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length]).sort((a, b) => b[1] - a[1])[0];
    const avg = doneRows.reduce((a, c) => a + (new Date(c.actionAt) - new Date(c.at)), 0) / doneRows.length;
    out.push({ tone: 'good', title: 'Resolution speed', text: `Average resolution time is ${fmtSpan(avg)}.${slow ? ` ${slow[0]} takes the longest (${fmtSpan(slow[1])}).` : ''}` });
  }
  if (n >= 5) {
    const hours = {};
    rows.forEach(c => { const h = new Date(c.at).getHours(); if (!isNaN(h)) hours[h] = (hours[h] || 0) + 1; });
    const top = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
    if (top) { const h = Number(top[0]); const lab = (x) => `${((x + 11) % 12) + 1} ${x < 12 ? 'AM' : 'PM'}`; out.push({ tone: 'info', title: 'Peak hour', text: `Most tickets are raised between ${lab(h)} and ${lab((h + 1) % 24)}. Keep a technician available in this window.` }); }
  }
  const rated = rows.filter(c => c.rating);
  if (rated.length >= 3) {
    const poor = rated.filter(c => c.rating === 'poor').length;
    const happy = rated.filter(c => c.rating === 'excellent' || c.rating === 'very_good' || c.rating === 'good').length;
    out.push({ tone: poor ? 'warn' : 'good', title: 'Employee satisfaction', text: `${Math.round((happy / rated.length) * 100)}% of rated tickets are Good or better${poor ? `; ${poor} rated Poor need a follow-up` : ''}.` });
  }
  return out;
};

function AiBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: .6,
      color: C.navy, background: C.goldL, border: `1px solid ${C.border2}`
    }}>AI</span>
  );
}

function AiInsightsPanel({ rows, techs }) {
  const items = useMemo(() => buildInsights(rows, techs, Date.now()), [rows, techs]);
  const tone = { info: C.navy, warn: '#b45309', good: '#15803d' };
  return (
    <Card style={{ padding: 20, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <AiBadge />
        <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>Insights</span>
        <span style={{ fontSize: 12, color: C.muted }}>Generated automatically from live ticket data</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            background: C.glassHi, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px',
            boxShadow: `inset 3px 0 0 ${tone[it.tone] || C.navy}`
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: tone[it.tone] || C.navy, marginBottom: 4 }}>{it.title}</div>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.55 }}>{it.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Progress stepper (Raised -> Reviewed -> With technician -> Resolved) ──
function TicketStepper({ c, compact = false }) {
  if (c.status === 'refused') {
    return <div style={{ fontSize: 12, fontWeight: 600, color: C.red, background: C.redL, borderRadius: 8, padding: '6px 10px' }}>Refused</div>;
  }
  const done = c.status === 'resolved' || c.status === 'closed';
  const stage = done ? 3 : c.status === 'hold' ? (c.assignedTo ? 2 : 1) : 0;
  const steps = ['Raised', 'Reviewed', 'With technician', 'Resolved'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((label, i) => {
        const reached = i <= stage;
        const current = i === stage && !done;
        return (
          <div key={label} style={{ flex: i === steps.length - 1 ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: reached ? (done ? '#16a34a' : C.navy) : C.glassHi, border: `2px solid ${reached ? (done ? '#16a34a' : C.navy) : C.border2}`,
                boxShadow: current ? `0 0 0 4px ${C.navy}22` : 'none'
              }} />
              {i < steps.length - 1 && <span style={{ flex: 1, height: 2, background: i < stage ? (done ? '#16a34a' : C.navy) : C.border2, margin: '0 4px', borderRadius: 2 }} />}
            </div>
            {!compact && <span style={{ fontSize: 10.5, color: reached ? C.text2 : C.muted, fontWeight: reached ? 600 : 500, marginTop: 5, whiteSpace: 'nowrap' }}>{label}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Employee feedback: editable for 3 minutes after it is first saved ──
const FEEDBACK_EDIT_MS = 3 * 60 * 1000;

const feedbackState = (t, nowMs) => {
  const has = !!t.rating || !!(t.ratingRemark || '').trim();
  const at = t.ratedAt ? new Date(t.ratedAt).getTime() : 0;
  const left = at ? Math.max(0, FEEDBACK_EDIT_MS - (nowMs - at)) : 0;
  return { has, locked: has && left === 0, left };
};

const fmtClock = (ms) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function FeedbackPanel({ ticket, onRate, onRemark }) {
  const nowMs = useNowTick(1000);
  const [draft, setDraft] = useState(ticket.ratingRemark || '');
  const docId = ticket._docId;
  useEffect(() => { setDraft(ticket.ratingRemark || ''); }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps
  const fb = feedbackState(ticket, nowMs);
  const chip = (r, active, disabled) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled && !active ? .5 : 1,
    border: `1.5px solid ${active ? r.color : C.border2}`, background: active ? `${r.color}18` : '#fff', color: active ? r.color : C.text2
  });
  return (
    <SectionCard title={fb.locked ? 'Your feedback' : 'Rate this resolution'}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {RATING_OPTIONS.map(r => (
          <button key={r.key} disabled={fb.locked} onClick={() => onRate(ticket, r.key)} style={chip(r, ticket.rating === r.key, fb.locked)}>{r.label}</button>
        ))}
      </div>
      {fb.locked ? (
        <>
          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 10 }}>
            <span style={{ color: C.muted }}>Remark: </span>{na(ticket.ratingRemark)}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#15803d', fontWeight: 600, background: '#e6f6ee', borderRadius: 99, padding: '5px 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
            Feedback submitted. It can no longer be edited.
          </div>
        </>
      ) : (
        <>
          <FieldLabel>Remark (optional)</FieldLabel>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2}
            placeholder="Add a remark about the resolution" style={{ ...inputStyle, resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <Btn onClick={() => onRemark(ticket, draft)} variant="primary" size="sm">Save Feedback</Btn>
            <span style={{ fontSize: 12, color: C.muted }}>
              {fb.has ? `You can edit this feedback for ${fmtClock(fb.left)} more.` : 'After saving, you can edit it for 3 minutes.'}
            </span>
          </div>
        </>
      )}
    </SectionCard>
  );
}

// ── Grid card used by the admin / technician ticket list ───────
function TicketGridCard({ c, onOpen }) {
  const active = c.status === 'open' || c.status === 'hold';
  const sla = slaState(c, Date.now());
  const st = STATUS_CFG[c.status] || { dot: C.muted };
  const clamp = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
  const row = (k, v) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, padding: '3px 0' }}>
      <span style={{ color: C.muted, flexShrink: 0 }}>{k}</span>
      <span style={{ color: na(v) === 'N/A' ? C.muted : C.text2, fontWeight: 600, textAlign: 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{na(v)}</span>
    </div>
  );
  return (
    <div onClick={() => onOpen(c)}
      style={{
        background: C.glassHi, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: `inset 4px 0 0 ${st.dot}, 0 1px 2px rgba(16,24,40,0.04)`, transition: 'box-shadow .15s, transform .15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `inset 4px 0 0 ${st.dot}, 0 6px 18px rgba(16,24,40,0.10)`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `inset 4px 0 0 ${st.dot}, 0 1px 2px rgba(16,24,40,0.04)`; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.navy, fontWeight: 700,
          background: C.goldL, padding: '3px 9px', borderRadius: 6, letterSpacing: .4
        }}>{c.id}</span>
        <PriorityBadge priority={c.priority} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{typeKey(c.type)}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{na(c.dept)}</div>
      </div>
      <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.5, minHeight: 39, wordBreak: 'break-word', ...clamp }}>{na(c.desc)}</div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
        {row('Employee', c.userName)}
        {row('Technician', c.assignedToName || (active ? 'Not assigned' : ''))}
        {row('Raised', c.at ? fmtDT(c.at) : '')}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Badge status={c.status} />
          {sla && <span style={{ fontSize: 11, fontWeight: 600, color: '#b45309' }}>Overdue {fmtSpan(sla.idle)}</span>}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>View details</span>
      </div>
    </div>
  );
}

// ── EXCEL REPORTS (styled: borders, theme header, status colours, N/A) ──
const xlHex = (c) => String(c || '#000000').replace('#', '').toUpperCase();
const XL_LINE = { style: 'thin', color: { rgb: 'C9D3CF' } };
const XL_BORDER = { top: XL_LINE, bottom: XL_LINE, left: XL_LINE, right: XL_LINE };
const xlStyle = (o = {}) => ({
  font: { name: 'Calibri', sz: o.sz || 11, bold: !!o.bold, color: { rgb: o.color || '1F2937' } },
  fill: o.fill ? { patternType: 'solid', fgColor: { rgb: o.fill } } : { patternType: 'none' },
  alignment: { horizontal: o.h || 'left', vertical: o.v || 'center', wrapText: o.wrap !== false },
  border: o.noBorder ? {} : XL_BORDER
});
const XL_STATUS = {
  open: { color: '1D4ED8', fill: 'DBEAFE' },
  hold: { color: '9A5B0B', fill: 'FEF3C7' },
  resolved: { color: '0F6B46', fill: 'D1FAE5' },
  closed: { color: '0F6B46', fill: 'D1FAE5' },
  refused: { color: 'B42318', fill: 'FEE2E2' },
};
const XL_PRIORITY = { high: { color: 'B42318', fill: 'FEE2E2' }, medium: { color: '9A5B0B', fill: 'FEF3C7' }, low: { color: '0F6B46', fill: 'D1FAE5' } };
const xlTick = (d) => (d || new Date()).toISOString().slice(0, 10);

const xlTheme = () => {
  const mix = (hex, pct) => { // lighten towards white
    const n = parseInt(hex, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = (v) => Math.round(v + (255 - v) * pct).toString(16).padStart(2, '0');
    return (f(r) + f(g) + f(b)).toUpperCase();
  };
  const p = xlHex(C.navy);
  return { primary: p, dark: xlHex(C.navy2), tint: mix(p, 0.9), tint2: mix(p, 0.82) };
};

const xlPut = (ws, r, c, v, s) => {
  const ref = XLSX.utils.encode_cell({ r, c });
  const isNum = typeof v === 'number' && isFinite(v);
  ws[ref] = { v: isNum ? v : (v == null ? '' : String(v)), t: isNum ? 'n' : 's', s };
};
const xlRange = (ws, rows, cols) => { ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows - 1, c: cols - 1 } }); };

function buildTicketReport(rows, meta) {
  const th = xlTheme();
  const wb = XLSX.utils.book_new();
  const isDone = (c) => c.status === 'resolved' || c.status === 'closed';
  const label = (c) => STATUS_CFG[c.status]?.label || c.status;
  const total = rows.length;
  const cnt = (f) => rows.filter(f).length;
  const open = cnt(c => c.status === 'open'), hold = cnt(c => c.status === 'hold');
  const done = cnt(isDone), refused = cnt(c => c.status === 'refused');
  const activeRows = rows.filter(isActiveTicket);
  const resolvedRows = rows.filter(c => isDone(c) && c.actionAt && c.at);
  const avgMs = resolvedRows.length ? resolvedRows.reduce((a, c) => a + (new Date(c.actionAt) - new Date(c.at)), 0) / resolvedRows.length : 0;
  const rate = total ? Math.round((done / total) * 100) : 0;
  const nowMs = Date.now();
  const overdue = activeRows.filter(c => slaState(c, nowMs)).length;
  const highActive = activeRows.filter(c => c.priority === 'high').length;
  const unassigned = activeRows.filter(c => !c.assignedTo).length;

  // ───── Sheet 1: Dashboard
  const ws = {};
  const COLS = 8;
  let r = 0;
  const merges = [];
  const fillRow = (rowIdx, s) => { for (let c = 0; c < COLS; c++) xlPut(ws, rowIdx, c, '', s); };
  fillRow(r, xlStyle({ fill: th.primary, noBorder: true }));
  xlPut(ws, r, 0, 'Choithram Hospital & Research Centre', xlStyle({ fill: th.primary, color: 'FFFFFF', bold: true, sz: 18, noBorder: true, wrap: false }));
  merges.push({ s: { r, c: 0 }, e: { r, c: COLS - 1 } }); r++;
  fillRow(r, xlStyle({ fill: th.dark, noBorder: true }));
  xlPut(ws, r, 0, 'IDAR Ticket Report - Performance Dashboard', xlStyle({ fill: th.dark, color: 'FFFFFF', sz: 12, noBorder: true, wrap: false }));
  merges.push({ s: { r, c: 0 }, e: { r, c: COLS - 1 } }); r++;
  const metaStyle = xlStyle({ fill: th.tint, color: '374151', sz: 10, noBorder: true, wrap: false });
  [`Generated: ${fmtDT(new Date().toISOString())}`, `Scope: ${meta.scope}`, `Filters: ${meta.filters}`].forEach(t => {
    fillRow(r, metaStyle); xlPut(ws, r, 0, t, metaStyle); merges.push({ s: { r, c: 0 }, e: { r, c: COLS - 1 } }); r++;
  });
  r++;

  const kpi = (row, col, labelTxt, value, note, color, fill) => {
    xlPut(ws, row, col, labelTxt, xlStyle({ fill, color, bold: true, sz: 10, h: 'center' }));
    xlPut(ws, row + 1, col, value, xlStyle({ fill, color, bold: true, sz: 22, h: 'center' }));
    xlPut(ws, row + 2, col, note, xlStyle({ fill, color: '6B7280', sz: 9, h: 'center' }));
  };
  const k1 = [
    ['TOTAL TICKETS', total, 'In this report', th.primary, th.tint2],
    ['OPEN', open, 'Awaiting action', '1D4ED8', 'DBEAFE'],
    ['PROCESSING', hold, 'Work in progress', '9A5B0B', 'FEF3C7'],
    ['RESOLVED / CLOSED', done, 'Completed', '0F6B46', 'D1FAE5'],
    ['REFUSED', refused, 'Not taken forward', 'B42318', 'FEE2E2'],
    ['RESOLUTION RATE', `${rate}%`, 'Resolved of total', rate >= 80 ? '0F6B46' : rate >= 50 ? '9A5B0B' : 'B42318', rate >= 80 ? 'D1FAE5' : rate >= 50 ? 'FEF3C7' : 'FEE2E2'],
    ['AVG RESOLUTION TIME', resolvedRows.length ? fmtSpan(avgMs) : 'N/A', 'Raised to resolved', th.primary, th.tint2],
    ['ACTIVE TICKETS', activeRows.length, 'Open + Processing', th.primary, th.tint2],
  ];
  k1.forEach((k, i) => kpi(r, i, ...k));
  r += 3;
  for (let c = 0; c < COLS; c++) xlPut(ws, r, c, '', xlStyle({ noBorder: true }));
  r++;
  const k2 = [
    ['HIGH PRIORITY ACTIVE', highActive, 'Needs attention', highActive ? 'B42318' : '0F6B46', highActive ? 'FEE2E2' : 'D1FAE5'],
    ['NOT ASSIGNED', unassigned, 'Active, no technician', unassigned ? '9A5B0B' : '0F6B46', unassigned ? 'FEF3C7' : 'D1FAE5'],
    ['OVERDUE (NO UPDATE)', overdue, 'Past SLA limit', overdue ? 'B42318' : '0F6B46', overdue ? 'FEE2E2' : 'D1FAE5'],
  ];
  k2.forEach((k, i) => kpi(r, i, ...k));
  r += 3;
  r++;

  const table = (title, headers, body, opts = {}) => {
    fillRow(r, xlStyle({ fill: th.tint2, noBorder: true }));
    xlPut(ws, r, 0, title, xlStyle({ fill: th.tint2, color: th.primary, bold: true, sz: 12, noBorder: true, wrap: false }));
    merges.push({ s: { r, c: 0 }, e: { r, c: COLS - 1 } }); r++;
    headers.forEach((h, i) => xlPut(ws, r, i, h, xlStyle({ fill: th.primary, color: 'FFFFFF', bold: true, h: i === 0 ? 'left' : 'center' })));
    r++;
    if (body.length === 0) {
      xlPut(ws, r, 0, 'N/A', xlStyle({ color: '6B7280' }));
      for (let i = 1; i < headers.length; i++) xlPut(ws, r, i, 'N/A', xlStyle({ color: '6B7280', h: 'center' }));
      r++;
    }
    body.forEach((row, ri) => {
      const zebra = ri % 2 === 1 ? 'F6F8F7' : 'FFFFFF';
      row.forEach((v, i) => {
        let st = xlStyle({ fill: zebra, h: i === 0 ? 'left' : 'center', bold: i === 0 });
        if (opts.rateCol === i && typeof v === 'number') {
          const good = v >= 80, mid = v >= 50;
          st = xlStyle({ fill: good ? 'D1FAE5' : mid ? 'FEF3C7' : 'FEE2E2', color: good ? '0F6B46' : mid ? '9A5B0B' : 'B42318', bold: true, h: 'center' });
          v = `${v}%`;
        }
        xlPut(ws, r, i, v === '' || v == null ? 'N/A' : v, st);
      });
      r++;
    });
    for (let c = 0; c < COLS; c++) xlPut(ws, r, c, '', xlStyle({ noBorder: true }));
    r++;
  };
  const group = (keyFn) => {
    const m = {};
    rows.forEach(c => { const k = keyFn(c) || 'N/A'; (m[k] = m[k] || []).push(c); });
    return Object.entries(m).map(([k, list]) => {
      const d = list.filter(isDone).length;
      return [k, list.length, list.filter(c => c.status === 'open').length, list.filter(c => c.status === 'hold').length, d,
        list.filter(c => c.status === 'refused').length, Math.round((d / list.length) * 100)];
    }).sort((a, b) => b[1] - a[1]);
  };
  const GH = ['', 'Total', 'Open', 'Processing', 'Resolved / Closed', 'Refused', 'Resolution %'];
  table('Tickets by Category', ['Category', ...GH.slice(1)], group(c => typeKey(c.type)), { rateCol: 6 });
  table('Tickets by Department / Location (Top 15)', ['Department / Location', ...GH.slice(1)], group(c => c.dept).slice(0, 15), { rateCol: 6 });
  table('Tickets by Priority', ['Priority', ...GH.slice(1)],
    ['high', 'medium', 'low'].map(p => {
      const list = rows.filter(c => (c.priority || DEFAULT_PRIORITY) === p);
      const d = list.filter(isDone).length;
      return [PRIORITY_CFG[p].label, list.length, list.filter(c => c.status === 'open').length, list.filter(c => c.status === 'hold').length, d,
        list.filter(c => c.status === 'refused').length, list.length ? Math.round((d / list.length) * 100) : 0];
    }), { rateCol: 6 });
  const techMap = {};
  rows.filter(c => c.assignedToName).forEach(c => { (techMap[c.assignedToName] = techMap[c.assignedToName] || []).push(c); });
  table('Technician Performance', ['Technician', 'Assigned', 'Active', 'Resolved', 'Avg Resolution Time', 'Resolution %', '', ''],
    Object.entries(techMap).map(([name, list]) => {
      const d = list.filter(c => isDone(c) && c.actionAt);
      const avg = d.length ? fmtSpan(d.reduce((a, c) => a + (new Date(c.actionAt) - new Date(c.at)), 0) / d.length) : 'N/A';
      return [name, list.length, list.filter(isActiveTicket).length, list.filter(isDone).length, avg, Math.round((list.filter(isDone).length / list.length) * 100), '', ''];
    }).sort((a, b) => b[1] - a[1]), { rateCol: 5 });

  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 19 }, { wch: 15 }, { wch: 19 }, { wch: 17 }];
  ws['!rows'] = [{ hpt: 30 }];
  xlRange(ws, r, COLS);
  XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');

  // ───── Sheet 2: Ticket register
  const ts = {};
  const H = ['Sr', 'Ticket ID', 'Priority', 'Status', 'Category', 'Department / Location', 'Employee Name', 'Employee ID', 'Description',
    'Raised On', 'Assigned Technician', 'Allocated On', 'Resolved By', 'Resolved On', 'Time Taken', 'Action Taken', 'Latest Update', 'Refusal Reason', 'Rating', 'Employee Remark'];
  H.forEach((h, i) => xlPut(ts, 0, i, h, xlStyle({ fill: th.primary, color: 'FFFFFF', bold: true, h: 'center' })));
  const ratingLabel = (k) => (RATING_OPTIONS.find(x => x.key === k) || {}).label || '';
  rows.forEach((c, i) => {
    const zebra = i % 2 === 1 ? 'F6F8F7' : 'FFFFFF';
    const n = (v) => (v === undefined || v === null || String(v).trim() === '' ? 'N/A' : v);
    const finished = isDone(c);
    const vals = [
      i + 1, c.id, (PRIORITY_CFG[c.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).label, label(c), typeKey(c.type), c.dept, c.userName, c.empId, c.desc,
      c.at ? fmtDT(c.at) : '', c.assignedToName, c.assignedAt ? fmtDT(c.assignedAt) : '', finished ? c.actionBy : '',
      finished && c.actionAt ? fmtDT(c.actionAt) : '', finished && c.actionAt ? getDuration(c.at, c.actionAt) : '', c.solution,
      c.status === 'hold' && c.holdReason && !/^Allocated/.test(c.holdReason) ? c.holdReason : '', c.refuseReason, ratingLabel(c.rating), c.ratingRemark
    ];
    vals.forEach((v, ci) => {
      let st = xlStyle({ fill: zebra, h: [0, 1, 2, 3, 7, 9, 11, 13, 14, 18].includes(ci) ? 'center' : 'left', v: 'top', bold: ci === 1 });
      if (ci === 2) { const p = XL_PRIORITY[c.priority] || XL_PRIORITY.medium; st = xlStyle({ fill: p.fill, color: p.color, bold: true, h: 'center', v: 'top' }); }
      if (ci === 3) { const p = XL_STATUS[c.status] || XL_STATUS.open; st = xlStyle({ fill: p.fill, color: p.color, bold: true, h: 'center', v: 'top' }); }
      xlPut(ts, i + 1, ci, ci === 0 ? v : n(v), st);
    });
  });
  if (rows.length === 0) H.forEach((h, i) => xlPut(ts, 1, i, i === 0 ? 1 : 'N/A', xlStyle({ color: '6B7280', h: 'center' })));
  ts['!cols'] = [{ wch: 6 }, { wch: 13 }, { wch: 10 }, { wch: 13 }, { wch: 18 }, { wch: 26 }, { wch: 20 }, { wch: 12 }, { wch: 46 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 13 }, { wch: 36 }, { wch: 28 }, { wch: 24 }, { wch: 12 }, { wch: 28 }];
  ts['!rows'] = [{ hpt: 26 }];
  const lastRow = Math.max(rows.length, 1);
  xlRange(ts, lastRow + 1, H.length);
  ts['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: H.length - 1 } }) };
  XLSX.utils.book_append_sheet(wb, ts, 'Ticket Register');
  return wb;
}

function buildLogReport(rows) {
  const th = xlTheme();
  const wb = XLSX.utils.book_new();
  const ws = {};
  const H = ['Sr', 'Time', 'Type', 'Action', 'By (Name)', 'By (Username)', 'Ticket', 'Target', 'Details'];
  H.forEach((h, i) => xlPut(ws, 0, i, h, xlStyle({ fill: th.primary, color: 'FFFFFF', bold: true, h: 'center' })));
  const n = (v) => (v === undefined || v === null || String(v).trim() === '' ? 'N/A' : v);
  rows.forEach((l, i) => {
    const zebra = i % 2 === 1 ? 'F6F8F7' : 'FFFFFF';
    const vals = [i + 1, fmtDT(l.at), LOG_TYPES[l.type]?.label || l.type, l.action, l.actorName, l.actor, l.ticketId, l.target, l.details];
    vals.forEach((v, ci) => xlPut(ws, i + 1, ci, ci === 0 ? v : n(v), xlStyle({ fill: zebra, h: [0, 1, 2, 6].includes(ci) ? 'center' : 'left', v: 'top', bold: ci === 3 })));
  });
  if (rows.length === 0) H.forEach((h, i) => xlPut(ws, 1, i, i === 0 ? 1 : 'N/A', xlStyle({ color: '6B7280', h: 'center' })));
  ws['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 28 }, { wch: 22 }, { wch: 18 }, { wch: 13 }, { wch: 20 }, { wch: 60 }];
  ws['!rows'] = [{ hpt: 26 }];
  const lastRow = Math.max(rows.length, 1);
  xlRange(ws, lastRow + 1, H.length);
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: H.length - 1 } }) };
  XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
  return wb;
}

// ══════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ══════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('login'); // 'login' | 'forgot'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);
  useEffect(() => { document.documentElement.style.setProperty('--nav-h', '0px'); }, []);

  const [fpUsername, setFpUsername] = useState('');
  const [fpNew1, setFpNew1] = useState('');
  const [fpNew2, setFpNew2] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const existing = await FireDB.getUsers();
      if (!existing || existing.length < 2) {
        await FireDB.initUsers(INITIAL_USERS);
      }
      setInitDone(true);
    };
    init();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('Please enter username and password'); return; }
    if (!initDone) { setError('System initializing, please wait...'); return; }
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    try {
      const users = await FireDB.getUsers();
      if (!users) { setError('Cannot connect to database. Check Firebase setup.'); setLoading(false); return; }
      const u = users.find(u => safeLC(u.username) === safeLC(username.trim()));
      if (!u) { Logger.log('auth', 'LOGIN_FAILED', { username: username.trim() }, { details: 'Username not found' }); setError('Username not found'); setLoading(false); return; }
      if (u.password !== password) { Logger.log('auth', 'LOGIN_FAILED', u, { details: 'Incorrect password' }); setError('Incorrect password'); setLoading(false); return; }
      // Single-session enforcement: this login becomes the only valid session
      // for this account — any other tab/device logged in as this user will
      // be signed out automatically as soon as it sees the new session id.
      const sid = genSessionId();
      await FireDB.updateUser(u.username, { activeSessionId: sid });
      Logger.log('auth', 'LOGIN', u, { details: roleSummaryLabel(deriveUserPerms(u)) });
      onLogin({ ...u, activeSessionId: sid, _sessionId: sid });
    } catch (e) {
      setError('Login failed. Please try again.');
      console.error('Login error:', e);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setFpError(''); setFpSuccess('');
    if (!fpUsername.trim()) { setFpError('Please enter your username'); return; }
    if (fpNew1.length < 3) { setFpError('Password must be at least 3 characters'); return; }
    if (fpNew1 !== fpNew2) { setFpError('Passwords do not match'); return; }
    if (fpNew1 === DEFAULT_PASSWORD) { setFpError('Please choose a different password'); return; }
    setFpLoading(true);
    try {
      const users = await FireDB.getUsers();
      if (!users) { setFpError('Cannot connect to database'); setFpLoading(false); return; }
      const u = users.find(u => safeLC(u.username) === safeLC(fpUsername.trim()));
      if (!u) { setFpError('Username not found. Please check and try again.'); setFpLoading(false); return; }
      await FireDB.updateUser(u.username, { password: fpNew1, firstLogin: false });
      Logger.log('auth', 'PASSWORD_RESET_SELF_SERVICE', u, { details: 'Password changed from the Forgot Password screen' });
      setFpSuccess('Password changed successfully! You can now login.');
      setFpUsername(''); setFpNew1(''); setFpNew2('');
    } catch (e) {
      setFpError('Failed to reset password. Please try again.');
    }
    setFpLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'transparent', position: 'relative' }}>
      <style>{buildGS()}</style>
      <WaterBackground />
      <div style={{ position: 'absolute', top: 16, right: 18, zIndex: 20 }}><ThemeMenu light /></div>

      {/* ── LEFT — brand / slider panel ── */}
      <div className="login-left" style={{
        flex: '1 1 58%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', padding: '30px 44px'
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -120, width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle,${C.goldL},transparent 70%)`, pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          <div style={{
            fontSize: 30, fontWeight: 900, color: C.navy, letterSpacing: -0.5,
            textAlign: 'center', margin: '0 0 4px 0', position: 'relative'
          }}>
            Choithram Hospital &amp; Research Centre
            <div style={{
              width: 130, height: 5, borderRadius: 99, margin: '10px auto 0',
              background: `linear-gradient(90deg,${C.navy3},${C.gold})`
            }} />
          </div>
        </div>

        <LoginSlider />
      </div>

      {/* ── RIGHT — login card panel ── */}
      <div className="login-right" style={{
        flex: '1 1 42%', minWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', background: 'transparent',
        borderLeft: 'none'
      }}>
        <div className="fadeUp glass-card" style={{ width: '100%', maxWidth: 410, padding: '30px 30px 26px', borderRadius: 28, background: C.glassHi }}>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <img src={chrclogo} alt="Choithram Hospital & Research Centre" style={{ width: 130, height: 130, objectFit: 'contain' }} />
          </div>

          {tab === 'login' ? (
            <>
              <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 19, color: C.text, marginBottom: 22 }}>
                Login to CMS
              </h1>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>User Name</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ ...inputStyle, background: C.glassHi, border: `1.5px solid ${C.border2}` }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <SecretInput show={showPw} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ ...inputStyle, background: C.glassHi, border: `1.5px solid ${C.border2}`, paddingRight: 52 }} />
                  <button onClick={() => setShowPw(s => !s)} type="button"
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: C.navy, fontSize: 11, lineHeight: 1, fontWeight: 700, letterSpacing: .5
                    }}>
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: 6 }}>
                <button onClick={() => { setTab('forgot'); setError(''); setFpError(''); setFpSuccess(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.navy, fontSize: 12, fontWeight: 600, padding: '4px 0' }}>
                  Forgot password?
                </button>
              </div>

              {!initDone && (
                <div style={{
                  background: C.goldL, border: `1px solid ${C.gold}30`, borderRadius: 8,
                  padding: '8px 12px', color: C.navy, fontSize: 11.5, marginBottom: 10
                }}>
                  Connecting to database...
                </div>
              )}
              {error && (
                <div style={{
                  background: C.redL, border: `1px solid #fca5a5`, borderRadius: 8,
                  padding: '9px 13px', color: C.red, fontSize: 11.5, marginBottom: 10, fontWeight: 500
                }}>
                  {error}
                </div>
              )}
              <Btn onClick={handleLogin} disabled={loading || !initDone} style={{ width: '100%', marginTop: 4, padding: '13px' }} size="lg" variant="primary">
                {loading ? 'Signing in...' : 'Login'}
              </Btn>
              <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 16 }}>
                First time logging in? Use the default password — you'll be asked to set your own right after.
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <button onClick={() => { setTab('login'); setFpError(''); setFpSuccess(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
                <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 19, color: C.text }}>
                  Reset Password
                </h1>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>User Name</label>
                <input value={fpUsername} onChange={e => setFpUsername(e.target.value)}
                  style={{ ...inputStyle, background: C.glassHi, border: `1.5px solid ${C.border2}` }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>New Password</label>
                <SecretInput value={fpNew1} onChange={e => setFpNew1(e.target.value)}
                  placeholder="Minimum 3 characters" style={{ ...inputStyle, background: C.glassHi, border: `1.5px solid ${C.border2}` }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>Confirm New Password</label>
                <SecretInput value={fpNew2} onChange={e => setFpNew2(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  style={{ ...inputStyle, background: C.glassHi, border: `1.5px solid ${C.border2}` }} />
              </div>
              {fpError && (
                <div style={{
                  background: C.redL, border: `1px solid #fca5a5`, borderRadius: 8,
                  padding: '9px 13px', color: C.red, fontSize: 11.5, marginBottom: 10, fontWeight: 500
                }}>
                  {fpError}
                </div>
              )}
              {fpSuccess && (
                <div style={{
                  background: C.greenL, border: `1px solid #a7f3d0`, borderRadius: 8,
                  padding: '9px 13px', color: C.green, fontSize: 11.5, marginBottom: 10, fontWeight: 600
                }}>
                  {fpSuccess}
                </div>
              )}
              <Btn onClick={handleForgotPassword} disabled={fpLoading || !initDone} style={{ width: '100%', padding: '13px' }} size="lg" variant="primary">
                {fpLoading ? 'Resetting...' : 'Reset Password'}
              </Btn>
            </>
          )}

          <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Choithram Hospital &amp; Research Centre</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>IDAR Ticket System · Indore, Madhya Pradesh</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>Developed by Harish Hamad</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  FIRST LOGIN — PASSWORD CHANGE
// ══════════════════════════════════════════════════════════════
function ChangePasswordPage({ user, onDone, onLogout }) {
  const [form, setForm] = useState({ new1: '', new2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const handle = async () => {
    if (form.new1.length < 3) { setError('Password must be at least 3 characters'); return; }
    if (form.new1 !== form.new2) { setError('Passwords do not match'); return; }
    if (form.new1 === DEFAULT_PASSWORD) { setError('Please choose a different password'); return; }
    setError(''); setLoading(true);
    await FireDB.updateUser(user.username, { password: form.new1, firstLogin: false });
    Logger.log('auth', 'PASSWORD_CHANGED', user, { details: 'First-login password set' });
    onDone({ ...user, password: form.new1, firstLogin: false });
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <style>{buildGS()}</style>
      <div className="fadeUp" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16, background: C.navy, marginBottom: 12,
            boxShadow: `0 8px 20px ${C.navy}35`
          }}>
            <span style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>#</span>
          </div>
          <h2 style={{ color: C.text, fontSize: 19, fontWeight: 800, fontFamily: "'Poppins',sans-serif" }}>Set Your Password</h2>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>
            Welcome, <strong style={{ color: C.text }}>{user.displayName}</strong>!<br />Create a secure password to continue.
          </p>
        </div>
        <div style={{ background: C.glassHi, borderRadius: 18, padding: 26, boxShadow: `0 16px 44px ${C.navy}14`, border: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>New Password</FieldLabel>
            <SecretInput value={form.new1} onChange={e => f('new1', e.target.value)}
              placeholder="Minimum 3 characters" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Confirm Password</FieldLabel>
            <SecretInput value={form.new2} onChange={e => f('new2', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder="Re-enter your password" style={inputStyle} />
          </div>
          {error && <div style={{
            background: C.redL, border: `1px solid #fca5a5`, borderRadius: 8,
            padding: '9px 13px', color: C.red, fontSize: 11.5, marginBottom: 12
          }}>{error}</div>}
          <Btn onClick={handle} disabled={loading} style={{ width: '100%', padding: '12px' }} size="lg" variant="primary">
            {loading ? 'Saving...' : 'Set Password & Continue'}
          </Btn>
          <button onClick={onLogout} style={{
            width: '100%', marginTop: 10, background: 'none', border: 'none',
            color: C.muted, fontSize: 12, cursor: 'pointer', padding: 8
          }}>Cancel & Logout</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  USER PORTAL
// ══════════════════════════════════════════════════════════════
function UserPortal({ user, onLogout, canSwitch = false, onSwitchView }) {
  const [tab, setTab] = useState('form');
  const [form, setForm] = useState({ empId: '', dept: '', type: '', priority: DEFAULT_PRIORITY, desc: '' });
  const [submitting, setSubmitting] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [histFilters, setHistFilters] = useState({ from: '', to: '', status: '', search: '' });
  const [histVisibleCount, setHistVisibleCount] = useState(30);
  const sf = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const aiHint = useMemo(() => aiClassify(form.desc), [form.desc]);
  const hf = (k, v) => { setHistFilters(s => ({ ...s, [k]: v })); setHistVisibleCount(30); };

  // Feedback can be changed for 3 minutes after it is first saved, then it is locked.
  const rateTicket = async (c, key) => {
    if (feedbackState(c, Date.now()).locked) return;
    await FireDB.updateComplaint(c._docId, { rating: key, ratedAt: c.ratedAt || now() });
    Logger.log('ticket', 'TICKET_RATED', user, { ticketId: c.id, target: c.assignedTo || '', details: `Rating: ${key}` });
    toast.success('Feedback saved successfully');
  };

  const saveRatingRemark = async (c, text) => {
    if (feedbackState(c, Date.now()).locked) return;
    await FireDB.updateComplaint(c._docId, { ratingRemark: String(text || '').trim(), ratedAt: c.ratedAt || now() });
    toast.success('Feedback saved successfully');
  };

  useEffect(() => {
    const unsub1 = FireDB.subscribeComplaints(all => {
      const mine = all.filter(c => safeLC(c.userId) === safeLC(user.username));
      setMyComplaints(mine);
      if (selected) {
        const updated = mine.find(c => c._docId === selected._docId);
        if (updated) setSelected(updated);
      }
    });
    return () => { unsub1(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.username]);

  const submit = async () => {
    if (!form.dept || !form.type || !form.desc.trim()) {
      toast.error('Please fill all required fields'); return;
    }
    setSubmitting(true);
    const seq = await FireDB.getNextSeq();
    const ticket = {
      id: genTicket(seq),
      userId: user.username,
      userName: user.displayName,
      empId: form.empId.trim(),
      dept: form.dept,
      type: form.type,
      priority: form.priority || DEFAULT_PRIORITY,
      desc: form.desc.trim(),
      status: 'open',
      at: now(),
      history: [{
        status: 'open', at: now(), by: user.displayName, actionBy: '',
        note: 'New ticket raised — awaiting review.'
      }],
      actionBy: '', solution: '', actionAt: '', holdReason: '', refuseReason: '', rating: '', ratingRemark: ''
    };
    await FireDB.addComplaint(ticket);
    Logger.log('ticket', 'TICKET_CREATED', user, { ticketId: ticket.id, details: `${ticket.type} | ${ticket.dept} | ${ticket.priority}` });
    await sendWhatsAppAlert(ticket);
    toast.success(`Ticket ${ticket.id} submitted successfully`);
    setForm({ empId: '', dept: '', type: '', priority: DEFAULT_PRIORITY, desc: '' });
    setSubmitting(false);
    setTab('status');
  };

  const sortedComplaints = useMemo(() =>
    [...myComplaints].sort((a, b) => new Date(b.at) - new Date(a.at)),
    [myComplaints]);
  const recentComplaints = sortedComplaints.slice(0, 4);
  const liveSelected = selected ? (myComplaints.find(c => c._docId === selected._docId) || selected) : null;

  const historyFiltered = useMemo(() => sortedComplaints.filter(c => {
    if (histFilters.status && c.status !== histFilters.status) return false;
    if (histFilters.from && new Date(c.at) < new Date(histFilters.from)) return false;
    if (histFilters.to && new Date(c.at) > new Date(histFilters.to + 'T23:59:59')) return false;
    if (histFilters.search) {
      const s = histFilters.search.toLowerCase();
      if (!safeLC(c.id).includes(s) && !safeLC(c.type).includes(s) &&
        !safeLC(c.desc).includes(s) && !safeLC(c.dept).includes(s)) return false;
    }
    return true;
  }), [sortedComplaints, histFilters]);

  const countByStatus = useMemo(() => {
    const r = { open: 0, hold: 0, resolved: 0, refused: 0, closed: 0 };
    myComplaints.forEach(c => { if (r[c.status] !== undefined) r[c.status]++; });
    return r;
  }, [myComplaints]);

  const getStatusMessage = (c) => {
    switch (c.status) {
      case 'open': return { msg: 'Ticket registered. Awaiting review and allocation.', color: C.blue };
      case 'hold': return c.assignedToName
        ? { msg: `Assigned to ${c.assignedToName}. ${c.holdReason && !/^Allocated/.test(c.holdReason) ? c.holdReason : 'Work in progress.'}`, color: C.yellow }
        : { msg: `Under review.${c.holdReason ? ` ${c.holdReason}` : ''}`, color: C.yellow };
      case 'resolved': return { msg: `Resolved by ${c.actionBy || 'IT team'}. Solution: ${c.solution || '-'}`, color: C.green };
      case 'refused': return { msg: `Refused. Reason: ${c.refuseReason || '-'}`, color: C.red };
      case 'closed': return c.solution
        ? { msg: `Resolved by ${c.actionBy || 'IT team'}. Solution: ${c.solution}`, color: C.green }
        : { msg: 'Ticket closed.', color: C.muted };
      default: return null;
    }
  };

  const renderTicketCard = (c, onOpen) => {
    const statusMsg = getStatusMessage(c);
    const desc = c.desc || '';
    return (
      <Card key={c._docId || c.id} className="hover-lift" onClick={() => (onOpen ? onOpen(c) : setSelected(c))}
        style={{ padding: 16, cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.navy, fontWeight: 600 }}>{c.id}</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{typeKey(c.type)}</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{c.dept} &middot; {fmtDT(c.at)}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <PriorityBadge priority={c.priority} />
            <Badge status={c.status} />
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.55, wordBreak: 'break-word' }}>
          {desc.length > 140 ? desc.substring(0, 140) + '...' : desc}
        </div>
        <div style={{ marginTop: 14 }}><TicketStepper c={c} compact /></div>
        {statusMsg && (
          <div style={{
            marginTop: 10, padding: '8px 12px', background: C.inset, borderLeft: `3px solid ${statusMsg.color}`,
            borderRadius: 6, fontSize: 12.5, color: C.text2, lineHeight: 1.5, wordBreak: 'break-word'
          }}>
            {statusMsg.msg}
            {c.assignedToName && (
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>
                Technician: <strong style={{ color: C.text2 }}>{c.assignedToName}</strong>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <style>{buildGS()}</style>
      <TopBar
        subtitle="Employee Portal — Complaint & Request System"
        roleLabel="Employee"
        user={user}
        onLogout={onLogout}
        tabs={[['form', 'New Ticket'], ['status', 'My Tickets']]}
        activeTab={tab}
        onTabChange={setTab}
        tabBadges={{ status: myComplaints.length }}
        maxWidth={1500}
        extraActions={canSwitch ? (
          <Btn onClick={onSwitchView} variant="ghost" size="sm" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            Switch to Admin View
          </Btn>
        ) : null}
      />

      <div className="page-main" style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 16px' }}>
        {/* NEW TICKET FORM */}
        {tab === 'form' && (
          <div className="fadeUp">
            <Card style={{ padding: 28 }}>
              <div style={{ marginBottom: 26, paddingBottom: 22, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 3, height: 26, background: C.navy, borderRadius: 2 }} />
                  <h2 style={{ fontWeight: 700, fontSize: 20, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
                    Raise a New Ticket
                  </h2>
                </div>
                <p style={{ color: C.muted, fontSize: 14, marginLeft: 14 }}>
                  Provide the details below to raise a new ticket.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }} className="grid-2">
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel>Employee ID (optional)</FieldLabel>
                  <input value={form.empId} onChange={e => sf('empId', e.target.value)}
                    placeholder="e.g. EMP-0001" style={inputStyle} />
                </div>
                <SearchDropdown
                  label="Department/Location" required allowCustom
                  value={form.dept} onChange={v => sf('dept', v)}
                  options={DEPARTMENTS} placeholder="Search or type your department/location..." />
              </div>

              <SearchDropdown label="Category" required
                value={form.type} onChange={v => sf('type', v)}
                options={COMPLAINT_TYPES} placeholder="Search or select a category..." />

              <div style={{ marginBottom: 20 }}>
                <FieldLabel required>Priority</FieldLabel>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {Object.entries(PRIORITY_CFG).map(([key, p]) => {
                    const sel = form.priority === key;
                    return (
                      <button key={key} onClick={() => sf('priority', key)}
                        style={{
                          flex: '1 1 140px', padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                          border: `2px solid ${sel ? p.color : C.border2}`, background: sel ? p.bg : C.glassHi,
                          fontWeight: 700, fontSize: 14, color: sel ? p.color : C.text2, transition: 'all .15s',
                          textAlign: 'center'
                        }}>
                        {p.label}
                        {key === 'high' && <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, opacity: .85 }}>Urgent — needs quick attention</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <FieldLabel required>Description</FieldLabel>
                <textarea value={form.desc} onChange={e => sf('desc', e.target.value)}
                  rows={4} placeholder="Describe the issue or request in detail — what happened, since when, any error messages..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {(() => {
                const dup = myComplaints.find(c => isActiveTicket(c) && form.type && form.dept && typeKey(c.type) === form.type && c.dept === form.dept);
                const sugType = !!(aiHint && aiHint.type && aiHint.type !== form.type);
                const sugPri = !!(aiHint && aiHint.priority !== form.priority);
                if (!dup && !sugType && !sugPri) return null;
                return (
                  <div className="slideDown" style={{ background: C.goldL, border: `1px solid ${C.border2}`, borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'grid', gap: 10 }}>
                    {(sugType || sugPri) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <AiBadge />
                        <span style={{ fontSize: 13, color: C.text2 }}>
                          Suggested: {aiHint.type ? <strong>{aiHint.type}</strong> : null}{aiHint.type ? ', ' : ''}<strong>{PRIORITY_CFG[aiHint.priority].label} priority</strong>
                        </span>
                        <Btn onClick={() => { if (aiHint.type) sf('type', aiHint.type); sf('priority', aiHint.priority); }} variant="outline" size="sm">Apply</Btn>
                      </div>
                    )}
                    {dup && (
                      <div style={{ fontSize: 12.5, color: '#9a5b0b' }}>
                        You already have an active ticket <strong>{dup.id}</strong> for this category and location.
                      </div>
                    )}
                  </div>
                );
              })()}

              <Btn onClick={submit} disabled={submitting} style={{ padding: '13px 32px' }} size="lg" variant="primary">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Btn>
            </Card>
          </div>
        )}

        {/* MY TICKETS */}
        {tab === 'status' && (
          <div className="fadeUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(countByStatus).filter(([, v]) => v > 0).map(([k, v]) => (
                  <div key={k} style={{
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CFG[k]?.dot }} />
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{STATUS_CFG[k]?.label}:</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Live Updates
              </div>
            </div>

            {myComplaints.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 56 }}>
                <div style={{ fontWeight: 700, color: C.muted, fontSize: 16, fontFamily: "'Poppins',sans-serif" }}>No tickets yet</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>Submit your first ticket using the New Ticket tab</div>
              </Card>
            ) : (
              <>
                <div className="ticket-grid">
                  {recentComplaints.map(c => renderTicketCard(c))}
                </div>
                {sortedComplaints.length > 4 && (
                  <div style={{ textAlign: 'center', marginTop: 18 }}>
                    <Btn onClick={() => setHistoryOpen(true)} variant="outline" size="md">
                      View All Tickets ({sortedComplaints.length})
                    </Btn>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* All Tickets dialog — latest 4 shown on the page, everything searchable here */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="All My Tickets" width={980}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
          <input value={histFilters.search} onChange={e => hf('search', e.target.value)}
            placeholder="Search ID / category / issue..." style={{ ...inputStyle, fontSize: 12, padding: '9px 12px' }} />
          <select value={histFilters.status} onChange={e => hf('status', e.target.value)} style={{ ...inputStyle, fontSize: 12, padding: '9px 12px' }}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={histFilters.from} onChange={e => hf('from', e.target.value)}
            style={{ ...inputStyle, fontSize: 12, padding: '9px 12px' }} title="From date" />
          <input type="date" value={histFilters.to} onChange={e => hf('to', e.target.value)}
            style={{ ...inputStyle, fontSize: 12, padding: '9px 12px' }} title="To date" />
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
          {historyFiltered.length} of {sortedComplaints.length} tickets
        </div>
        {historyFiltered.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 30 }}>No tickets match these filters</div>
        ) : (
          <>
            <div className="ticket-grid" style={{ maxHeight: '62vh', overflow: 'auto', alignContent: 'start' }}>
              {historyFiltered.slice(0, histVisibleCount).map(c => renderTicketCard(c, (t) => setSelected(t)))}
            </div>
            {historyFiltered.length > histVisibleCount && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Btn onClick={() => setHistVisibleCount(v => v + 30)} variant="outline" size="sm">
                  Load More ({historyFiltered.length - histVisibleCount} remaining)
                </Btn>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Ticket window — large dialog, navbar stays */}
      <Modal open={!!liveSelected} onClose={() => setSelected(null)} fullscreen z={1010}
        title={liveSelected ? `Ticket ${liveSelected.id}  |  ${typeKey(liveSelected.type)}` : ''}>
        {liveSelected && (
          <TicketDetailView ticket={liveSelected} viewer="employee"
            mainExtra={(liveSelected.status === 'resolved' || liveSelected.status === 'closed')
              ? <FeedbackPanel ticket={liveSelected} onRate={rateTicket} onRemark={saveRatingRemark} /> : null} />
        )}
      </Modal>
      <TicketAssistant tickets={myComplaints} viewer="employee" me={user} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ADMIN PORTAL
// ══════════════════════════════════════════════════════════════
function AdminPortal({ user, onLogout, canSwitch = false, onSwitchView, onUserUpdate }) {
  const perms = deriveUserPerms(user);
  const [tab, setTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ dept: [], type: [], status: perms.adminScope === 'assigned' ? 'hold' : 'open', priority: [], assign: [], search: '', from: '', to: '' });
  // however many tickets pile up over months/years, only render a page's worth
  // at a time — keeps the list smooth on phones instead of dumping everything
  // into the DOM at once.
  const [visibleCount, setVisibleCount] = useState(20);
  const [actionModal, setActionModal] = useState(null);
  const [actionType, setActionType] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [pwModal, setPwModal] = useState(false);
  const [actionForm, setActionForm] = useState({ actionBy: '', solution: '', reason: '' });
  const [newAdminPw, setNewAdminPw] = useState({ pw1: '', pw2: '' });
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [resetPwModal, setResetPwModal] = useState(null);
  const [newPwForUser, setNewPwForUser] = useState('');
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(null);
  const [addUserModal, setAddUserModal] = useState(false);
  // userType: 'employee' | 'categoryAdmin' | 'fullAdmin'.
  // alsoEmployee only matters for the two admin types — it additionally lets
  // that person raise their own tickets and switch between Employee/Admin views.
  const [newUser, setNewUser] = useState({ username: '', displayName: '', password: '', userType: 'employee', alsoEmployee: false, adminCategories: [], headUsernames: [] });
  const [addUserError, setAddUserError] = useState('');
  const [permModal, setPermModal] = useState(null);
  const [permForm, setPermForm] = useState({ displayName: '', userType: 'employee', alsoEmployee: false, adminCategories: [], headUsernames: [] });
  const [permError, setPermError] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({ tech: '', note: '' });
  const [assignError, setAssignError] = useState('');

  // Keep an open ticket popup in sync with live data (so a fresh allocation or
  // new status shows up without closing and reopening it).
  useEffect(() => {
    setDetailModal(prev => {
      if (!prev) return prev;
      const fresh = complaints.find(x => x._docId === prev._docId);
      return fresh || prev;
    });
  }, [complaints]);
  const af = (k, v) => setActionForm(s => ({ ...s, [k]: v }));
  const setF = (k, v) => { setFilters(s => ({ ...s, [k]: v })); setVisibleCount(20); };
  const nu = (k, v) => setNewUser(s => ({ ...s, [k]: v }));
  const pf = (k, v) => setPermForm(s => ({ ...s, [k]: v }));

  useEffect(() => {
    const unsub1 = FireDB.subscribeComplaints(data => setComplaints(data));
    const loadUsers = async () => {
      // Technicians never need the user list, so don't pull it into their browser.
      if (perms.adminScope === 'assigned') return;
      const u = await FireDB.getUsers();
      if (u) setUsers(u);
    };
    loadUsers();
    return () => { unsub1(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Department-wise scoping: a Full Admin sees every ticket; a category-limited
  // admin only sees tickets whose category is in their assigned list.
  const scopedComplaints = useMemo(() => {
    if (perms.adminScope === 'all') return complaints;
    if (perms.adminScope === 'categories') return complaints.filter(c => perms.adminCategories.includes(typeKey(c.type)));
    if (perms.adminScope === 'assigned') return complaints.filter(c => safeLC(c.assignedTo) === safeLC(user.username));
    return [];
  }, [complaints, perms.adminScope, perms.adminCategories, user.username]);

  const scopedTypes = perms.adminScope === 'categories' ? COMPLAINT_TYPES.filter(t => perms.adminCategories.includes(t)) : COMPLAINT_TYPES;

  // Allocation helpers: every technician, only the ones reporting to me, and the
  // people a technician can be attached to as a head.
  const technicians = useMemo(() => users.filter(u => deriveUserPerms(u).isTechnician), [users]);
  const myTechnicians = useMemo(() => perms.adminScope === 'all'
    ? technicians
    : technicians.filter(t => headUsernamesOf(t).map(safeLC).includes(safeLC(user.username))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [technicians, perms.adminScope, user.username]);
  const filterTechnicians = useMemo(() => technicians.filter(t =>
    myTechnicians.some(m => m.username === t.username) || scopedComplaints.some(c => safeLC(c.assignedTo) === safeLC(t.username))),
  [technicians, myTechnicians, scopedComplaints]);
  const headOptions = useMemo(() => users.filter(u => { const p = deriveUserPerms(u); return p.isAdmin && !p.isTechnician; }), [users]);

  const deptOptionsInScope = useMemo(() => {
    const set = new Set(scopedComplaints.map(c => c.dept).filter(Boolean));
    return Array.from(set).sort();
  }, [scopedComplaints]);

  const markNotificationsSeen = async () => {
    const ts = now();
    await FireDB.updateUser(user.username, { lastSeenAt: ts });
    onUserUpdate && onUserUpdate({ ...user, lastSeenAt: ts });
  };

  const newTickets = useMemo(() => {
    const lastSeenAt = user.lastSeenAt || null;
    const stamp = (c) => (perms.adminScope === 'assigned' && c.assignedAt) ? c.assignedAt : c.at;
    return scopedComplaints
      .filter(c => c.status === 'open' || c.status === 'hold')
      .filter(c => !lastSeenAt || new Date(stamp(c)) > new Date(lastSeenAt))
      .sort((a, b) => new Date(stamp(b)) - new Date(stamp(a)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedComplaints, user.lastSeenAt, perms.adminScope]);

  // Opening the bell shows the current alerts and marks them read straight away,
  // so the badge clears and the same alerts never come back.
  const [notifList, setNotifList] = useState([]);
  const toggleNotif = () => {
    if (showNotif) { setShowNotif(false); return; }
    setNotifList(newTickets.slice(0, 10));
    setShowNotif(true);
    if (newTickets.length > 0) markNotificationsSeen();
  };

  // Real OS-level desktop notification on top of the in-app bell, so a new
  // ticket gets noticed even if this tab isn't focused. Guarded on every side —
  // browsers without the Notification API (iOS Safari, some Android WebViews,
  // non-HTTPS pages) simply skip this silently instead of crashing the app.
  const notifSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notifPermission, setNotifPermission] = useState(notifSupported ? Notification.permission : 'unsupported');
  const seenIdsRef = useRef(null);
  useEffect(() => {
    const currentIds = new Set(scopedComplaints.map(c => c._docId));
    if (seenIdsRef.current === null) {
      // First load after opening the portal — don't fire alerts for tickets
      // that already existed, only for ones that arrive from here on.
      seenIdsRef.current = currentIds;
      return;
    }
    const arrived = scopedComplaints.filter(c => !seenIdsRef.current.has(c._docId));
    seenIdsRef.current = currentIds;
    if (arrived.length === 0) return;
    if (!notifSupported || notifPermission !== 'granted') return;
    try {
      if (arrived.length === 1) {
        const c = arrived[0];
        new Notification(perms.adminScope === 'assigned' ? `Ticket Assigned To You — ${c.id}` : `New Ticket — ${c.id}`, { body: `${c.type} · ${c.dept}\n${c.userName}` });
      } else {
        new Notification(`${arrived.length} New Tickets`, { body: 'Open the admin portal to view them.' });
      }
    } catch (e) { console.warn('Desktop notification failed:', e); }
  }, [scopedComplaints, notifSupported, notifPermission, perms.adminScope]);

  const enableDesktopAlerts = () => {
    if (!notifSupported) return;
    try {
      const result = Notification.requestPermission();
      if (result && typeof result.then === 'function') {
        result.then(p => setNotifPermission(p));
      } else {
        setTimeout(() => setNotifPermission(Notification.permission), 500);
      }
    } catch (e) { console.warn('requestPermission failed:', e); }
  };

  const filtered = useMemo(() => {
    const rows = scopedComplaints.filter(c => {
      if (filters.dept.length && !filters.dept.includes(c.dept)) return false;
      if (filters.type.length && !filters.type.includes(c.type)) return false;
      if (filters.status === 'done') { if (c.status !== 'resolved' && c.status !== 'closed') return false; }
      else if (filters.status && c.status !== filters.status) return false;
      if (filters.priority.length && !filters.priority.includes(c.priority)) return false;
      if (filters.assign.length && !filters.assign.some(a => (a === 'unassigned' ? !c.assignedTo : safeLC(c.assignedTo) === safeLC(a)))) return false;
      if (filters.from && new Date(c.at) < new Date(filters.from)) return false;
      if (filters.to && new Date(c.at) > new Date(filters.to + 'T23:59:59')) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!safeLC(c.userName).includes(s) && !safeLC(c.empId).includes(s) &&
          !safeLC(c.id).includes(s) && !safeLC(c.dept).includes(s) &&
          !safeLC(c.desc).includes(s)) return false;
      }
      return true;
    });
    // Bubble unresolved High/Medium priority tickets to the top — otherwise an
    // urgent ticket can get buried under a long list of routine ones. Ties
    // keep the newest-first order the list already had (stable sort).
    const unresolvedWeight = (c) => (c.status === 'open' || c.status === 'hold')
      ? (PRIORITY_CFG[c.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).weight
      : 0;
    return [...rows].sort((a, b) => unresolvedWeight(b) - unresolvedWeight(a));
  }, [scopedComplaints, filters]);

  const stats = useMemo(() => {
    return {
      total: scopedComplaints.length,
      open: scopedComplaints.filter(c => c.status === 'open').length,
      hold: scopedComplaints.filter(c => c.status === 'hold').length,
      resolved: scopedComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
      refused: scopedComplaints.filter(c => c.status === 'refused').length,
    };
  }, [scopedComplaints]);

  const openAction = (complaint, type) => {
    setActionModal(complaint);
    setActionType(type);
    setActionForm({ actionBy: perms.adminScope === 'assigned' ? (user.displayName || '') : '', solution: '', reason: '' });
  };

  const openAssign = (c) => {
    setAssignModal(c);
    setAssignForm({ tech: c.assignedTo || '', note: '' });
    setAssignError('');
  };

  // Level-2 allocation: a head (or full admin) hands the ticket to a technician.
  // The ticket moves to Processing, the employee instantly sees who has it, and
  // the technician gets it in their own portal + alert.
  const doAssign = async () => {
    const c = assignModal;
    if (!assignForm.tech) { setAssignError('Please select a technician'); return; }
    const tech = technicians.find(t => safeLC(t.username) === safeLC(assignForm.tech));
    if (!tech) { setAssignError('Technician not found'); return; }
    if (c.assignedTo && safeLC(c.assignedTo) === safeLC(tech.username)) { setAssignError('Already assigned to this technician'); return; }
    const reassign = !!c.assignedTo;
    const note = assignForm.note.trim();
    const ts = now();
    const entry = {
      status: 'hold', at: ts, by: '', actionBy: user.displayName, role: 'head', kind: 'allocation',
      techName: tech.displayName, instruction: note,
      note: `${reassign ? 'Reallocated' : 'Allocated'} to technician ${tech.displayName} by ${user.displayName}.` +
        `${reassign ? ` Previously with ${c.assignedToName || c.assignedTo}.` : ''}${note ? ` Instruction: ${note}` : ''}`
    };
    const data = {
      assignedTo: tech.username, assignedToName: tech.displayName,
      assignedBy: user.username, assignedByName: user.displayName, assignedAt: ts,
      assignHistory: [...(c.assignHistory || []), { to: tech.username, toName: tech.displayName, by: user.username, byName: user.displayName, at: ts, note }],
      status: 'hold',
      holdReason: `Allocated to ${tech.displayName}`,
      history: [...(c.history || []), entry]
    };
    await FireDB.updateComplaint(c._docId, data);
    Logger.log('allocation', reassign ? 'TICKET_REASSIGNED' : 'TICKET_ASSIGNED', user, {
      ticketId: c.id, target: tech.username,
      details: `${reassign ? `From ${c.assignedToName || c.assignedTo} to` : 'To'} ${tech.displayName}${note ? ` — ${note}` : ''}`
    });
    setAssignModal(null);
    toast.success(`Ticket ${c.id} allocated to ${tech.displayName}`);
    setDetailModal({ ...c, ...data });
  };

  const doAction = async () => {
    const c = actionModal;
    const type = actionType;
    let newStatus = '', histEntries = [], updateData = {};
    const actorRole = perms.adminScope === 'assigned' ? 'technician' : 'admin';

    if (type === 'resolve') {
      if (!actionForm.actionBy.trim() || !actionForm.solution.trim()) { toast.error('Fill all fields'); return; }
      // Resolving a ticket automatically closes it
      newStatus = 'closed';
      histEntries = [
        {
          status: 'resolved', at: now(), by: '', actionBy: actionForm.actionBy, role: actorRole, detail: actionForm.solution,
          note: `Resolved. Solution: ${actionForm.solution}`
        },
        {
          status: 'closed', at: now(), by: '', actionBy: actionForm.actionBy, role: actorRole,
          note: 'Closed automatically after resolution.'
        }
      ];
      updateData = { actionBy: actionForm.actionBy, solution: actionForm.solution, actionAt: now() };
    } else if (type === 'hold') {
      if (!actionForm.reason.trim()) { toast.error('Please enter a reason'); return; }
      newStatus = 'hold';
      histEntries = [{
        status: 'hold', at: now(), by: '', actionBy: user.displayName, role: actorRole, detail: actionForm.reason,
        note: actorRole === 'technician' ? `Technician update: ${actionForm.reason}` : `Under review: ${actionForm.reason}`
      }];
      updateData = { holdReason: actionForm.reason };
    } else if (type === 'refuse') {
      if (!actionForm.reason.trim()) { toast.error('Please enter refusal reason'); return; }
      newStatus = 'refused';
      histEntries = [{
        status: 'refused', at: now(), by: '', actionBy: user.displayName, role: actorRole, detail: actionForm.reason,
        note: `Refused. Reason: ${actionForm.reason}`
      }];
      updateData = { refuseReason: actionForm.reason };
    } else if (type === 'close') {
      newStatus = 'closed';
      histEntries = [{
        status: 'closed', at: now(), by: '', actionBy: user.displayName, role: actorRole, detail: actionForm.reason || '',
        note: actionForm.reason ? `Closed. Note: ${actionForm.reason}` : 'Closed.'
      }];
    }

    await FireDB.updateComplaint(c._docId, {
      status: newStatus,
      history: [...(c.history || []), ...histEntries],
      ...updateData
    });
    const logNames = { resolve: 'TICKET_RESOLVED', hold: 'TICKET_PROCESSING', refuse: 'TICKET_REFUSED', close: 'TICKET_CLOSED' };
    Logger.log('ticket', logNames[type] || 'TICKET_UPDATED', user, {
      ticketId: c.id, target: c.userId,
      details: type === 'resolve' ? `Resolved by ${actionForm.actionBy}: ${actionForm.solution}` : (actionForm.reason || '')
    });
    setActionModal(null);
    setDetailModal(null);
    toast.success(type === 'resolve' ? `Ticket ${c.id} resolved successfully` : type === 'hold' ? (perms.adminScope === 'assigned' ? 'Update posted successfully' : `Ticket ${c.id} marked as processing`) : type === 'refuse' ? `Ticket ${c.id} refused` : `Ticket ${c.id} closed`);
  };

  const handleDeleteUser = async (u) => {
    if (safeLC(u.username) === safeLC(user.username)) {
      toast.error("You can't remove the account you're currently logged in as.");
      setDeleteUserConfirm(null);
      return;
    }
    await FireDB.deleteUser(u.username);
    Logger.log('user', 'USER_DELETED', user, { target: u.username, details: roleSummaryLabel(deriveUserPerms(u)) });
    setUsers(prev => prev.filter(x => x.username !== u.username));
    setDeleteUserConfirm(null);
  };

  // Turns the simple "userType + alsoEmployee + categories" choice into the
  // underlying isEmployee/isAdmin/adminScope/adminCategories + legacy role fields.
  const buildAccessFields = (userType, alsoEmployee, adminCategories, headUsernames = []) => {
    if (userType === 'fullAdmin') {
      return { isEmployee: !!alsoEmployee, isAdmin: true, adminScope: 'all', adminCategories: [], isTechnician: false, headUsernames: [], headUsername: '', role: alsoEmployee ? 'both' : 'admin' };
    }
    if (userType === 'categoryAdmin') {
      return { isEmployee: !!alsoEmployee, isAdmin: true, adminScope: 'categories', adminCategories, isTechnician: false, headUsernames: [], headUsername: '', role: alsoEmployee ? 'both' : 'admin' };
    }
    if (userType === 'technician') {
      return { isEmployee: !!alsoEmployee, isAdmin: true, adminScope: 'assigned', adminCategories: [], isTechnician: true, headUsernames, headUsername: headUsernames[0] || '', role: alsoEmployee ? 'both' : 'technician' };
    }
    return { isEmployee: true, isAdmin: false, adminScope: 'none', adminCategories: [], isTechnician: false, headUsernames: [], headUsername: '', role: 'user' };
  };

  const handleAddUser = async () => {
    setAddUserError('');
    if (!newUser.username.trim()) { setAddUserError('Username is required'); return; }
    if (!newUser.displayName.trim()) { setAddUserError('Display name is required'); return; }
    if (!newUser.password.trim() || newUser.password.length < 3) { setAddUserError('Password must be at least 3 characters'); return; }
    if (newUser.userType === 'categoryAdmin' && newUser.adminCategories.length === 0) {
      setAddUserError('Select at least one category for this admin, or choose Full Admin'); return;
    }
    if (newUser.userType === 'technician' && (newUser.headUsernames || []).length === 0) {
      setAddUserError('Select at least one head for this technician'); return;
    }
    const clean = newUser.username.trim().toLowerCase().replace(/\s+/g, '.');
    if (users.find(u => safeLC(u.username) === clean)) { setAddUserError('Username already exists'); return; }
    const access = buildAccessFields(newUser.userType, newUser.alsoEmployee, newUser.adminCategories, newUser.headUsernames || []);
    const userData = {
      username: clean,
      displayName: newUser.displayName.trim(),
      password: newUser.password,
      firstLogin: false,
      ...access
    };
    const ok = await FireDB.addUser(userData);
    if (ok) {
      setUsers(prev => [...prev, userData]);
      Logger.log('user', 'USER_ADDED', user, { target: clean, details: roleSummaryLabel(deriveUserPerms(userData)) });
      setAddUserModal(false);
      setNewUser({ username: '', displayName: '', password: '', userType: 'employee', alsoEmployee: false, adminCategories: [], headUsernames: [] });
      toast.success(`User "${clean}" added successfully`);
    } else {
      setAddUserError('Failed to add user. Please try again.');
    }
  };

  const openPermModal = (u) => {
    const p = deriveUserPerms(u);
    const userType = p.isAdmin ? (p.adminScope === 'categories' ? 'categoryAdmin' : p.adminScope === 'assigned' ? 'technician' : 'fullAdmin') : 'employee';
    setPermForm({ displayName: u.displayName || '', userType, alsoEmployee: p.isAdmin ? p.isEmployee : false, adminCategories: p.adminCategories, headUsernames: p.headUsernames || [] });
    setPermError('');
    setPermModal(u);
  };

  const saveUserPermissions = async () => {
    setPermError('');
    if (!permForm.displayName.trim()) { setPermError('Display name cannot be empty'); return; }
    if (permForm.userType === 'categoryAdmin' && permForm.adminCategories.length === 0) {
      setPermError('Select at least one category, or choose Full Admin'); return;
    }
    if (permForm.userType === 'technician' && (permForm.headUsernames || []).length === 0) {
      setPermError('Select at least one head for this technician'); return;
    }
    const access = buildAccessFields(permForm.userType, permForm.alsoEmployee, permForm.adminCategories, permForm.headUsernames || []);
    const data = { displayName: permForm.displayName.trim(), ...access };
    await FireDB.updateUser(permModal.username, data);
    Logger.log('user', 'USER_ACCESS_CHANGED', user, { target: permModal.username, details: `Now: ${roleSummaryLabel(deriveUserPerms({ ...permModal, ...data }))}${(data.headUsernames || []).length ? ` (heads: ${data.headUsernames.join(', ')})` : ''}` });
    setUsers(prev => prev.map(u => u.username === permModal.username ? { ...u, ...data } : u));
    setPermModal(null);
  };

  const exportExcel = () => {
    const bits = [];
    if (filters.status) bits.push(`Status: ${filters.status === 'done' ? 'Resolved / Closed' : (STATUS_CFG[filters.status]?.label || filters.status)}`);
    if (filters.type.length) bits.push(`Category: ${filters.type.join(', ')}`);
    if (filters.dept.length) bits.push(`Department: ${filters.dept.join(', ')}`);
    if (filters.priority.length) bits.push(`Priority: ${filters.priority.map(p => (PRIORITY_CFG[p] || {}).label || p).join(', ')}`);
    if (filters.assign.length) bits.push(`Technician: ${filters.assign.map(a => (a === 'unassigned' ? 'Not assigned' : ((technicians.find(t => t.username === a) || {}).displayName || a))).join(', ')}`);
    if (filters.from) bits.push(`From: ${filters.from}`);
    if (filters.to) bits.push(`To: ${filters.to}`);
    if (filters.search) bits.push(`Search: ${filters.search}`);
    const scope = perms.adminScope === 'all' ? 'All categories'
      : perms.adminScope === 'categories' ? perms.adminCategories.join(', ') || 'N/A' : 'Tickets allocated to me';
    const rows = [...filtered].sort((x, y) => new Date(y.at) - new Date(x.at));
    const wb = buildTicketReport(rows, { scope, filters: bits.length ? bits.join(' | ') : 'None (all records)' });
    const scopeTag = perms.adminScope === 'categories' ? `_${perms.adminCategories.join('-')}`.replace(/[^A-Za-z0-9_-]/g, '') : '';
    XLSX.writeFile(wb, `CHRC_IDAR_Ticket_Report${scopeTag}_${xlTick()}.xlsx`);
  };

  const changeAdminPw = async () => {
    if (newAdminPw.pw1.length < 3) { toast.error('Min 3 characters'); return; }
    if (newAdminPw.pw1 !== newAdminPw.pw2) { toast.error("Passwords don't match"); return; }
    await FireDB.updateUser(user.username, { password: newAdminPw.pw1 });
    Logger.log('auth', 'PASSWORD_CHANGED', user, { details: 'Changed from admin portal' });
    setPwModal(false); setNewAdminPw({ pw1: '', pw2: '' });
    toast.success('Password changed successfully');
  };

  const resetUserPw = async () => {
    if (!newPwForUser.trim()) { toast.error('Enter new password'); return; }
    await FireDB.updateUser(resetPwModal.username, { password: newPwForUser, firstLogin: true });
    Logger.log('user', 'PASSWORD_RESET_BY_ADMIN', user, { target: resetPwModal.username, details: 'Temporary password set, change forced at next login' });
    setResetPwModal(null); setNewPwForUser('');
    toast.success(`Password reset for ${resetPwModal.username}`);
  };

  const kpiExtra = useMemo(() => {
    const doneRows = scopedComplaints.filter(c => (c.status === 'resolved' || c.status === 'closed') && c.actionAt && c.at);
    const avgMs = doneRows.length ? doneRows.reduce((acc, c) => acc + (new Date(c.actionAt) - new Date(c.at)), 0) / doneRows.length : 0;
    const nowMs = Date.now();
    return {
      rate: stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0,
      avg: doneRows.length ? fmtSpan(avgMs) : 'N/A',
      overdue: scopedComplaints.filter(c => slaState(c, nowMs)).length
    };
  }, [scopedComplaints, stats]);

  const chartData = useMemo(() => {
    const map = {};
    scopedComplaints.forEach(c => {
      const d = new Date(c.at);
      const key = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
      if (!map[key]) map[key] = { month: key, total: 0, resolved: 0, hold: 0, refused: 0 };
      map[key].total++;
      if (['resolved', 'closed'].includes(c.status)) map[key].resolved++;
      else if (c.status === 'hold') map[key].hold++;
      else if (c.status === 'refused') map[key].refused++;
    });
    return Object.values(map).slice(-12);
  }, [scopedComplaints]);

  const typeData = useMemo(() =>
    scopedTypes.map(t => ({ name: t, value: scopedComplaints.filter(c => c.type === t).length }))
      .filter(d => d.value > 0), [scopedComplaints, scopedTypes]);

  const chartColors = () => [C.navy, C.gold2, '#059669', '#dc2626', '#7c3aed'];

  const filteredUsers = useMemo(() =>
    users.filter(u => safeLC(u.username).includes(userSearch.toLowerCase()) ||
      safeLC(u.displayName).includes(userSearch.toLowerCase()))
    , [users, userSearch]);

  const TABS = perms.adminScope === 'all'
    ? [['complaints', 'Tickets'], ['analytics', 'Analytics'], ['users', 'Users'], ['logs', 'Logs']]
    : [['complaints', 'Tickets'], ['analytics', 'Analytics']];

  const selectStyle = { ...inputStyle, fontSize: 12, padding: '9px 12px', height: 40 };

  const getActionButtons = (c) => {
    const go = (fn) => () => { fn(); setDetailModal(null); };
    const isTech = perms.adminScope === 'assigned';
    const list = [];
    if (c.status === 'open' || c.status === 'hold') {
      if (perms.canAssign) list.push(<Btn key="assign" onClick={go(() => openAssign(c))} variant="purple" size="sm">{c.assignedTo ? 'Reassign' : 'Assign'}</Btn>);
      list.push(<Btn key="resolve" onClick={go(() => openAction(c, 'resolve'))} variant="success" size="sm">Resolve</Btn>);
      if (c.status === 'open' && !isTech) list.push(<Btn key="hold" onClick={go(() => openAction(c, 'hold'))} variant="warning" size="sm">Process</Btn>);
      if (c.status === 'hold' && isTech) list.push(<Btn key="update" onClick={go(() => openAction(c, 'hold'))} variant="warning" size="sm">Post Update</Btn>);
      if (c.status === 'hold' && !isTech) list.push(<Btn key="close" onClick={go(() => openAction(c, 'close'))} variant="ghost" size="sm">Close</Btn>);
      if (!isTech) list.push(<Btn key="refuse" onClick={go(() => openAction(c, 'refuse'))} variant="danger" size="sm">Refuse</Btn>);
    } else if (c.status === 'resolved') {
      list.push(<Btn key="close" onClick={go(() => openAction(c, 'close'))} variant="ghost" size="sm">Close</Btn>);
    }
    if (!isTech) list.push(<Btn key="print" onClick={() => printComplaint(c)} variant="outline" size="sm">Print</Btn>);
    return list;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <style>{buildGS()}</style>
      <TopBar
        subtitle={perms.adminScope === 'assigned' ? 'Technician Portal — My Allocated Tickets' : 'Admin Portal — Complaint & Request Management System'}
        roleLabel={roleSummaryLabel(perms)}
        user={user}
        onLogout={onLogout}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        maxWidth={1680}
        extraActions={
          <>
            {notifSupported && notifPermission === 'default' && (
              <Btn onClick={enableDesktopAlerts} variant="ghost" size="sm"
                style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} title="Get a system alert even when this tab isn't focused">
                Enable Alerts
              </Btn>
            )}
            <div style={{ position: 'relative' }}>
              <button onClick={toggleNotif}
                style={{
                  position: 'relative', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 16, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} title="Notifications">
                <BellIcon />
                {newTickets.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff',
                    borderRadius: 99, fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                    border: '2px solid ' + C.navy2
                  }}>{newTickets.length > 99 ? '99+' : newTickets.length}</span>
                )}
              </button>
              {showNotif && (
                <div className="slideDown" style={{
                  position: 'absolute', top: 44, right: 0, width: 320, background: C.glassPop, backdropFilter: 'blur(22px) saturate(170%)', WebkitBackdropFilter: 'blur(22px) saturate(170%)', borderRadius: 16,
                  boxShadow: '0 20px 50px #0b2a2240', border: `1px solid ${C.border}`, zIndex: 400, overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{perms.adminScope === 'assigned' ? 'Assigned to you' : 'New tickets'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setShowNotif(false)} title="Close"
                        style={{ background: 'none', border: 'none', color: C.muted, fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 320, overflow: 'auto' }}>
                    {notifList.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 12.5 }}>No new notifications</div>
                    ) : notifList.map(c => (
                      <div key={c._docId} onClick={() => { setDetailModal(c); setShowNotif(false); setTab('complaints'); }}
                        style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.navy, fontWeight: 700 }}>{c.id}</span>
                          <span style={{ fontSize: 10.5, color: C.muted }}>{fmtDT(perms.adminScope === 'assigned' && c.assignedAt ? c.assignedAt : c.at)}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.text2, fontWeight: 600, marginTop: 2 }}>{typeKey(c.type)} · {c.dept}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {WHATSAPP_GROUP_LINK !== 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_CODE' && (
              <a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noreferrer"
                style={{
                  padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  background: 'rgba(37,211,102,0.15)'
                }}>
                WA Group
              </a>
            )}
            {canSwitch && (
              <Btn onClick={onSwitchView} variant="ghost" size="sm" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                Switch to Employee View
              </Btn>
            )}
            <Btn onClick={() => setPwModal(true)} variant="ghost" size="sm" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              Change Password
            </Btn>
          </>
        }
      />

      <div className="page-main" style={{ maxWidth: 1680, margin: '0 auto', padding: '24px 20px' }}>
        {/* COMPLAINTS TAB */}
        {tab === 'complaints' && (
          <div className="fadeUp app-shell">
            {(() => {
              const segs = [
                ['', 'All', stats.total, C.navy],
                ['open', 'Open', stats.open, '#2563eb'],
                ['hold', 'Processing', stats.hold, '#d97706'],
                ['done', 'Resolved', stats.resolved, '#10b981'],
                ['refused', 'Refused', stats.refused, '#ef4444'],
              ];
              const activeFilters = ['type', 'dept', 'priority', 'assign', 'from', 'to'].filter(k => (Array.isArray(filters[k]) ? filters[k].length > 0 : !!filters[k])).length;
              const seg = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 99, cursor: 'pointer', fontSize: 12.5, whiteSpace: 'nowrap' };
              const vbtn = (k, label) => (
                <button key={k} onClick={() => setViewMode(k)}
                  style={{
                    padding: '6px 14px', fontSize: 12.5, cursor: 'pointer', border: 'none', fontWeight: 600,
                    background: viewMode === k ? C.navy : C.glassHi, color: viewMode === k ? '#fff' : C.text2
                  }}>{label}</button>
              );
              return (
                <Card style={{ padding: '12px 14px', marginBottom: 12, flexShrink: 0, maxHeight: '55%', overflowY: 'auto', background: C.glassHi }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 190 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, display: 'flex', pointerEvents: 'none' }}><SearchIcon /></span>
                      <input value={filters.search} onChange={e => setF('search', e.target.value)}
                        placeholder="Search name, ID or issue"
                        style={{ ...inputStyle, paddingLeft: 36, height: 38, fontSize: 13 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {segs.map(([k, label, n, col]) => (
                        <button key={label} onClick={() => setF('status', k)}
                          style={{
                            ...seg, border: `1px solid ${filters.status === k ? C.navy : C.border2}`,
                            background: filters.status === k ? C.goldL : C.glassHi,
                            color: filters.status === k ? C.navy : C.text2, fontWeight: filters.status === k ? 700 : 500
                          }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
                          {label}
                          <span style={{ fontWeight: 700 }}>{n}</span>
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
                      <Btn onClick={() => setShowFilters(v => !v)} variant={showFilters ? 'soft' : 'ghost'} size="sm">
                        Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
                      </Btn>
                      <div style={{ display: 'inline-flex', border: `1px solid ${C.border2}`, borderRadius: 8, overflow: 'hidden' }}>
                        {vbtn('grid', 'Grid')}{vbtn('table', 'Table')}
                      </div>
                      <Btn onClick={exportExcel} variant="primary" size="sm">Export Excel</Btn>
                    </div>
                  </div>
                  {showFilters && (
                    <div className="slideDown" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                      <MultiSelect value={filters.type} onChange={v => setF('type', v)} placeholder="All Categories" style={selectStyle} options={scopedTypes} />
                      <MultiSelect value={filters.dept} onChange={v => setF('dept', v)} placeholder="All Departments / Locations" style={selectStyle} options={deptOptionsInScope} />
                      <MultiSelect value={filters.priority} onChange={v => setF('priority', v)} placeholder="All Priorities" style={selectStyle} options={Object.entries(PRIORITY_CFG).map(([k, v]) => ({ value: k, label: v.label }))} />
                      {perms.adminScope !== 'assigned' && (
                        <MultiSelect value={filters.assign} onChange={v => setF('assign', v)} placeholder="All Allocations" style={selectStyle}
                          options={[{ value: 'unassigned', label: 'Not Assigned Yet' }, ...filterTechnicians.map(t => ({ value: t.username, label: t.displayName }))]} />
                      )}
                      <input type="date" value={filters.from} onChange={e => setF('from', e.target.value)} style={selectStyle} title="From date" />
                      <input type="date" value={filters.to} onChange={e => setF('to', e.target.value)} style={selectStyle} title="To date" />
                      <Btn onClick={() => { setFilters({ dept: [], type: [], status: '', priority: [], assign: [], search: '', from: '', to: '' }); setVisibleCount(20); }}
                        variant="ghost" size="sm" style={{ height: 40 }}>Clear all</Btn>
                    </div>
                  )}
                </Card>
              );
            })()}

            <div style={{ fontSize: 12, color: C.muted, margin: '0 2px 10px', flexShrink: 0 }}>
              Showing {Math.min(filtered.length, visibleCount)} of {filtered.length} tickets{filtered.length !== scopedComplaints.length ? ` (total ${scopedComplaints.length})` : ''}
            </div>

            <div className={viewMode === 'grid' ? 'app-scroll' : 'app-fill'}>
            {filtered.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontWeight: 600, color: C.muted }}>No tickets match the current view</div>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="ticket-grid">
                {filtered.slice(0, visibleCount).map(c => <TicketGridCard key={c._docId || c.id} c={c} onOpen={setDetailModal} />)}
              </div>
            ) : (
              <Card style={{ padding: 0, overflow: 'hidden', flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.9)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
                <div className="sticky-table" style={{ flex: 1, minHeight: 0 }}>
                  <table style={{ width: '100%', minWidth: 1020, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.goldL, borderBottom: `1px solid ${C.border2}` }}>
                        {['Ticket', 'Priority', 'Employee', 'Category', 'Department / Location', 'Status', 'Technician', 'Raised', ''].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: .6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, visibleCount).map((c, i) => {
                        const active = c.status === 'open' || c.status === 'hold';
                        const sla = slaState(c, Date.now());
                        return (
                          <tr key={c._docId || c.id} onClick={() => setDetailModal(c)}
                            style={{ background: i % 2 === 0 ? C.row1 : C.row2, borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}26`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? C.row1 : C.row2; }}>
                            <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.navy, fontWeight: 700 }}>{c.id}</span>
                            </td>
                            <td style={{ padding: '11px 14px' }}><PriorityBadge priority={c.priority} /></td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{na(c.userName)}</div>
                              <div style={{ fontSize: 11, color: C.muted }}>{na(c.empId)}</div>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 13, color: C.text2, whiteSpace: 'nowrap' }}>{typeKey(c.type)}</td>
                            <td style={{ padding: '11px 14px', fontSize: 13, color: C.text2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{na(c.dept)}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <Badge status={c.status} />
                              {sla && <div style={{ fontSize: 10.5, color: '#b45309', fontWeight: 600, marginTop: 3 }}>Overdue {fmtSpan(sla.idle)}</div>}
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 12.5, whiteSpace: 'nowrap', color: c.assignedToName ? C.text2 : C.muted, fontWeight: c.assignedToName ? 600 : 400 }}>
                              {c.assignedToName || (active ? 'Not assigned' : 'N/A')}
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{c.at ? fmtDT(c.at) : 'N/A'}</td>
                            <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                              <Btn onClick={() => setDetailModal(c)} variant="outline" size="sm">View</Btn>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            {filtered.length > visibleCount && (
              <div style={{ textAlign: 'center', marginTop: 18, flexShrink: 0 }}>
                <Btn onClick={() => setVisibleCount(v => v + 20)} variant="outline" size="md">
                  Load more ({filtered.length - visibleCount} remaining)
                </Btn>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="fadeUp">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 12, marginBottom: 18 }}>
              <KpiTile label="Total tickets" value={stats.total} color={C.navy} bg={C.goldL} note="All tickets in scope" />
              <KpiTile label="Open" value={stats.open} color="#1d4ed8" bg="#eaf1ff" note="Awaiting action" />
              <KpiTile label="Processing" value={stats.hold} color="#9a5b0b" bg="#fdf3df" note="Work in progress" />
              <KpiTile label="Resolved / Closed" value={stats.resolved} color="#0f6b46" bg="#e6f6ee" note="Completed" />
              <KpiTile label="Refused" value={stats.refused} color="#b42318" bg="#fdecea" note="Not taken forward" />
              <KpiTile label="Resolution rate" value={`${kpiExtra.rate}%`} color={kpiExtra.rate >= 80 ? '#0f6b46' : kpiExtra.rate >= 50 ? '#9a5b0b' : '#b42318'} bg={kpiExtra.rate >= 80 ? '#e6f6ee' : kpiExtra.rate >= 50 ? '#fdf3df' : '#fdecea'} note="Resolved of total" />
              <KpiTile label="Avg resolution time" value={kpiExtra.avg} color={C.navy} bg={C.goldL} note="Raised to resolved" />
              <KpiTile label="Overdue" value={kpiExtra.overdue} color={kpiExtra.overdue ? '#b42318' : '#0f6b46'} bg={kpiExtra.overdue ? '#fdecea' : '#e6f6ee'} note="No update past SLA" />
            </div>
            <AiInsightsPanel rows={scopedComplaints} techs={technicians} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }} className="grid-2">
              <Card style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 18, color: C.text, fontFamily: "'Poppins',sans-serif" }}>Monthly Trend</div>
                {chartData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: C.muted, padding: 40 }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.navy} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.navy} stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                      <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(16,24,40,0.15)', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="total" stroke={C.navy} strokeWidth={2} fill="url(#totalGrad)" name="Total" />
                      <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} fill="url(#resolvedGrad)" name="Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
              <Card style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 18, color: C.text, fontFamily: "'Poppins',sans-serif" }}>By Type</div>
                {typeData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: C.muted, padding: 40 }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                        dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false} fontSize={11}>
                        {typeData.map((_, i) => <Cell key={i} fill={chartColors()[i % chartColors().length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(16,24,40,0.15)', borderRadius: 12, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>
            <Card style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 18, color: C.text, fontFamily: "'Poppins',sans-serif" }}>Monthly Status Breakdown</div>
              {chartData.length === 0 ? (
                <div style={{ textAlign: 'center', color: C.muted, padding: 40 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
                    <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(16,24,40,0.15)', borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="resolved" fill="#059669" name="Resolved" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hold" fill="#d97706" name="Processing" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="refused" fill="#dc2626" name="Refused" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        )}

        {/* USERS TAB — full admins only */}
        {tab === 'users' && perms.adminScope === 'all' && (
          <div className="fadeUp app-shell">
            <Card style={{ padding: 22, marginBottom: 16, flexShrink: 0, background: C.glassHi }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: C.text, fontFamily: "'Poppins',sans-serif" }}>User Management</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, alignSelf: 'center' }}>{filteredUsers.length} users</span>
                  <Btn onClick={() => { setAddUserModal(true); setAddUserError(''); setNewUser({ username: '', displayName: '', password: '', userType: 'employee', alsoEmployee: false, adminCategories: [], headUsernames: [] }); }}
                    variant="primary" size="sm">Add User</Btn>
                </div>
              </div>
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by username or name..."
                style={{ ...inputStyle, marginBottom: 0 }} />
            </Card>
            <div className="app-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12, alignContent: 'start' }}>
              {filteredUsers.slice(0, 100).map(u => {
                const up = deriveUserPerms(u);
                return (
                  <Card key={u.username} style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: up.isFullAdmin ? C.navy : up.isAdmin ? '#3b4a6b' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: '#fff', fontWeight: 700, flexShrink: 0
                        }}>
                          {(u.displayName || u.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, lineHeight: 1.2 }}>{u.displayName || u.username}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{u.username}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '3px 9px', borderRadius: 99, fontWeight: 700,
                        background: C.goldL, border: `1px solid ${C.border}`,
                        color: C.text2, letterSpacing: .3, textTransform: 'uppercase'
                      }}>
                        {roleSummaryLabel(up)}
                      </span>
                    </div>
                    {up.isTechnician && (
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
                        Reports to: <strong style={{ color: C.text2 }}>{up.headUsernames.map(hu => (users.find(x => safeLC(x.username) === safeLC(hu)) || {}).displayName || hu).join(', ') || 'not set'}</strong>
                      </div>
                    )}
                    {up.isAdmin && up.adminScope === 'categories' && (
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
                        Categories: <strong style={{ color: C.text2 }}>{up.adminCategories.join(', ') || 'none selected'}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: u.firstLogin ? C.yellow : C.green, fontWeight: 600 }}>
                        {u.firstLogin ? 'Default password' : 'Custom password'}
                      </span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Btn onClick={() => openPermModal(u)} variant="outline" size="sm">Edit</Btn>
                        <Btn onClick={() => { setResetPwModal(u); setNewPwForUser(''); }} variant="ghost" size="sm">Reset</Btn>
                        <Btn onClick={() => setDeleteUserConfirm(u)} variant="danger" size="sm">Remove</Btn>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {filteredUsers.length > 100 && (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, marginTop: 16 }}>
                Showing first 100 of {filteredUsers.length} users. Use search to find specific users.
              </div>
            )}
          </div>
        )}
        {tab === 'logs' && perms.adminScope === 'all' && <LogsPanel />}
      </div>

      {/* Ticket window — large dialog, navbar stays */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} fullscreen
        title={detailModal ? `Ticket ${detailModal.id}  |  ${typeKey(detailModal.type)}` : ''}>
        {detailModal && (
          <TicketDetailView ticket={detailModal} viewer={perms.adminScope === 'assigned' ? 'technician' : 'head'}
            sideActions={<>{getActionButtons(detailModal)}</>}
            mainExtra={(detailModal.status === 'resolved' || detailModal.status === 'closed') ? (
              <SectionCard title="Employee Feedback">
                {(() => {
                  const r = RATING_OPTIONS.find(x => x.key === detailModal.rating);
                  return r ? (
                    <span style={{
                      display: 'inline-flex', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${r.color}`, background: `${r.color}18`, color: r.color
                    }}>{r.label}</span>
                  ) : <div style={{ fontSize: 13, color: C.muted }}>Rating: N/A</div>;
                })()}
                <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginTop: 10 }}>
                  <span style={{ color: C.muted }}>Remark: </span>{na(detailModal.ratingRemark)}
                </div>
              </SectionCard>
            ) : null} />
        )}
      </Modal>

      {/* Assign / Reassign Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)}
        title={assignModal && assignModal.assignedTo ? 'Reassign Ticket' : 'Assign to Technician'} width={480}>
        {assignModal && (
          <div>
            <div style={{ background: C.inset, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.navy, fontWeight: 700 }}>{assignModal.id}</div>
              <div style={{ fontSize: 13, color: C.text2, marginTop: 4 }}>{assignModal.type} · {assignModal.dept}</div>
              {assignModal.assignedToName && (
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Currently with: <strong style={{ color: C.text2 }}>{assignModal.assignedToName}</strong></div>
              )}
            </div>
            {(() => {
              const rec = recommendTechnician(myTechnicians, complaints, assignModal);
              if (!rec || myTechnicians.length < 2) return null;
              return (
                <div style={{ background: C.goldL, border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <AiBadge />
                  <span style={{ fontSize: 12.5, color: C.text2, flex: 1, minWidth: 160 }}>
                    Recommended: <strong>{rec.tech.displayName}</strong> ({rec.active} active, {rec.similar} similar resolved)
                  </span>
                  <Btn onClick={() => setAssignForm(f => ({ ...f, tech: rec.tech.username }))} variant="outline" size="sm">Use</Btn>
                </div>
              );
            })()}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Technician</FieldLabel>
              {myTechnicians.length === 0 ? (
                <div style={{ fontSize: 12.5, color: C.muted }}>No technicians are mapped to you.</div>
              ) : (
                <select value={assignForm.tech} onChange={e => setAssignForm(f => ({ ...f, tech: e.target.value }))} style={inputStyle}>
                  <option value="">Select technician</option>
                  {myTechnicians.map(t => {
                    const active = complaints.filter(x => safeLC(x.assignedTo) === safeLC(t.username) && (x.status === 'open' || x.status === 'hold')).length;
                    return <option key={t.username} value={t.username}>{t.displayName} ({active} active)</option>;
                  })}
                </select>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Instruction for technician (optional)</FieldLabel>
              <textarea value={assignForm.note} onChange={e => setAssignForm(f => ({ ...f, note: e.target.value }))}
                rows={2} placeholder="e.g. Please check today before 3 PM" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {assignError && (
              <div style={{ background: C.redL, border: '1px solid #fca5a5', borderRadius: 9, padding: '10px 14px', color: C.red, fontSize: 12, marginBottom: 14 }}>{assignError}</div>
            )}
            <Btn onClick={doAssign} variant="primary" size="md" style={{ width: '100%' }} disabled={myTechnicians.length === 0}>Confirm Allocation</Btn>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)}
        title={actionType === 'resolve' ? 'Resolve Ticket' : actionType === 'hold' ? (perms.adminScope === 'assigned' ? 'Post Update' : 'Mark as Processing') : actionType === 'refuse' ? 'Refuse Ticket' : 'Close Ticket'}
        width={480}>
        {actionModal && (
          <div>
            <div style={{ background: C.inset, borderRadius: 10, padding: '10px 14px', marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Ticket</div>
              <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.navy }}>{actionModal.id}</div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{actionModal.userName} · {actionModal.dept}</div>
            </div>
            {actionType === 'resolve' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel required>Resolved by</FieldLabel>
                  <input value={actionForm.actionBy} onChange={e => af('actionBy', e.target.value)}
                    placeholder="Name" style={inputStyle} />
                </div>
                {(() => {
                  const sug = suggestSolutions(complaints, actionModal);
                  if (!sug.length) return null;
                  return (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <AiBadge /><span style={{ fontSize: 12, color: C.muted }}>Suggested actions from similar tickets</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {sug.map(txt => (
                          <button key={txt} onClick={() => af('solution', txt)} className="menu-item"
                            style={{ padding: '5px 11px', borderRadius: 99, border: `1px solid ${C.border2}`, background: C.glassHi, color: C.text2, fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>{txt}</button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel required>Action taken</FieldLabel>
                  <textarea value={actionForm.solution} onChange={e => af('solution', e.target.value)}
                    rows={3} placeholder="Describe the action taken"
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="success" size="md" style={{ width: '100%' }}>Resolve and Close</Btn>
              </>
            )}
            {actionType === 'hold' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel required>{perms.adminScope === 'assigned' ? 'Update for the employee' : 'Remarks'}</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e => af('reason', e.target.value)}
                    rows={3} placeholder="Current status of the work"
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="primary" size="md" style={{ width: '100%' }}>{perms.adminScope === 'assigned' ? 'Post Update' : 'Mark as Processing'}</Btn>
              </>
            )}
            {actionType === 'refuse' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel required>Reason for Refusal</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e => af('reason', e.target.value)}
                    rows={3} placeholder="Reason for refusal"
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="primary" size="md" style={{ width: '100%' }}>Refuse Ticket</Btn>
              </>
            )}
            {actionType === 'close' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel>Closing note</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e => af('reason', e.target.value)}
                    rows={3} placeholder="Closing note" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="ghost" size="md" style={{ width: '100%' }}>Close Ticket</Btn>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Remove User Confirm Modal */}
      <Modal open={!!deleteUserConfirm} onClose={() => setDeleteUserConfirm(null)} title="Remove User" width={400}>
        {deleteUserConfirm && (
          <div>
            <div style={{ background: C.redL, borderRadius: 12, padding: 18, marginBottom: 18, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: C.red, fontSize: 16, marginBottom: 6 }}>Confirm Removal</div>
              <div style={{ color: C.red, fontSize: 13, lineHeight: 1.6 }}>
                Permanently remove <strong>{deleteUserConfirm.displayName}</strong> ({deleteUserConfirm.username})?<br />
                <span style={{ fontSize: 12, opacity: .8 }}>They will no longer be able to log in. This cannot be undone.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={() => setDeleteUserConfirm(null)} variant="ghost" size="md" style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={() => handleDeleteUser(deleteUserConfirm)} variant="danger" size="md" style={{ flex: 1 }}>Remove User</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal open={addUserModal} onClose={() => setAddUserModal(false)} title="Add New User" width={520}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Username (login ID)</FieldLabel>
            <input value={newUser.username} onChange={e => nu('username', e.target.value)}
              placeholder="e.g. john.doe" style={inputStyle} />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Lowercase, dots allowed. Spaces auto-converted to dots.</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Display Name</FieldLabel>
            <input value={newUser.displayName} onChange={e => nu('displayName', e.target.value)}
              placeholder="e.g. John Doe" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Password</FieldLabel>
            <SecretInput value={newUser.password} onChange={e => nu('password', e.target.value)}
              placeholder="Min 3 characters" style={inputStyle} />
          </div>

          <UserTypeFields form={newUser} set={nu} headOptions={headOptions} />

          {addUserError && (
            <div style={{
              background: C.redL, border: `1px solid #fca5a5`, borderRadius: 9,
              padding: '10px 14px', color: C.red, fontSize: 12, marginBottom: 14
            }}>{addUserError}</div>
          )}
          <Btn onClick={handleAddUser} variant="primary" size="md" style={{ width: '100%' }}>Add User</Btn>
        </div>
      </Modal>

      {/* Edit Access / Permissions Modal (full admins only) */}
      <Modal open={!!permModal} onClose={() => setPermModal(null)} title="Edit User" width={520}>
        {permModal && (
          <div>
            <div style={{ background: C.inset, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: C.muted }}>Username (login ID, cannot be changed):</div>
              <div style={{ fontWeight: 700, color: C.text, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>{permModal.username}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Display Name</FieldLabel>
              <input value={permForm.displayName} onChange={e => pf('displayName', e.target.value)}
                placeholder="e.g. John Doe" style={inputStyle} />
            </div>

            <UserTypeFields form={permForm} set={pf} headOptions={headOptions} />

            {permError && (
              <div style={{
                background: C.redL, border: `1px solid #fca5a5`, borderRadius: 9,
                padding: '10px 14px', color: C.red, fontSize: 12, marginBottom: 14
              }}>{permError}</div>
            )}
            <Btn onClick={saveUserPermissions} variant="primary" size="md" style={{ width: '100%' }}>Save Changes</Btn>
          </div>
        )}
      </Modal>

      {/* Change Admin Password Modal */}
      <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password" width={400}>
        <div style={{ marginBottom: 16 }}>
          <FieldLabel>New Password</FieldLabel>
          <SecretInput value={newAdminPw.pw1} onChange={e => setNewAdminPw(s => ({ ...s, pw1: e.target.value }))}
            placeholder="Min 3 characters" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Confirm Password</FieldLabel>
          <SecretInput value={newAdminPw.pw2} onChange={e => setNewAdminPw(s => ({ ...s, pw2: e.target.value }))}
            placeholder="Re-enter password" style={inputStyle} />
        </div>
        <Btn onClick={changeAdminPw} variant="primary" size="md" style={{ width: '100%' }}>Change Password</Btn>
      </Modal>

      {/* Reset User Password Modal */}
      <Modal open={!!resetPwModal} onClose={() => setResetPwModal(null)} title="Reset User Password" width={400}>
        {resetPwModal && (
          <div>
            <div style={{ background: C.inset, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: C.muted }}>Resetting password for:</div>
              <div style={{ fontWeight: 700, color: C.text, marginTop: 3 }}>{resetPwModal.displayName}</div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{resetPwModal.username}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <FieldLabel required>New Password</FieldLabel>
              <SecretInput value={newPwForUser} onChange={e => setNewPwForUser(e.target.value)}
                placeholder="Enter new password" style={inputStyle} />
            </div>
            <div style={{ background: C.yellowL, borderRadius: 8, padding: '9px 13px', marginBottom: 16, fontSize: 12, color: C.yellow }}>
              The user will be prompted to change their password on next login.
            </div>
            <Btn onClick={resetUserPw} variant="primary" size="md" style={{ width: '100%' }}>Reset Password</Btn>
          </div>
        )}
      </Modal>
      <TicketAssistant tickets={scopedComplaints} viewer={perms.adminScope === 'assigned' ? 'technician' : 'head'} me={user} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  LOGS PANEL (Full Admin only)
// ══════════════════════════════════════════════════════════════
function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [lf, setLf] = useState({ type: '', search: '', from: '', to: '' });
  const [visible, setVisible] = useState(50);
  const setF2 = (k, v) => { setLf(s => ({ ...s, [k]: v })); setVisible(50); };

  useEffect(() => {
    const unsub = Logger.subscribe(rows => { setLogs(rows); setLoaded(true); }, 1000);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => logs.filter(l => {
    if (lf.type && l.type !== lf.type) return false;
    if (lf.from && new Date(l.at) < new Date(lf.from)) return false;
    if (lf.to && new Date(l.at) > new Date(lf.to + 'T23:59:59')) return false;
    if (lf.search) {
      const s = lf.search.toLowerCase();
      if (![l.action, l.actor, l.actorName, l.ticketId, l.target, l.details].some(v => safeLC(v).includes(s))) return false;
    }
    return true;
  }), [logs, lf]);

  const counts = useMemo(() => {
    const r = {};
    logs.forEach(l => { r[l.type] = (r[l.type] || 0) + 1; });
    return r;
  }, [logs]);

  const exportLogs = () => {
    const wb = buildLogReport(filtered);
    XLSX.writeFile(wb, `CHRC_IDAR_Activity_Log${lf.type ? '_' + lf.type : ''}_${xlTick()}.xlsx`);
  };

  const sel = { ...inputStyle, fontSize: 12, padding: '9px 12px', height: 40 };

  return (
    <div className="fadeUp app-shell">
      <div style={{ flexShrink: 0 }}>
      <Card style={{ padding: '14px 20px', marginBottom: 10, background: C.glassHi }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>
          Log Type
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setF2('type', '')}
            style={{
              padding: '6px 14px', borderRadius: 99, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              border: `1.5px solid ${lf.type === '' ? C.navy : C.border2}`,
              background: lf.type === '' ? C.navy : C.glassHi, color: lf.type === '' ? '#fff' : C.text2
            }}>All Logs ({logs.length})</button>
          {Object.entries(LOG_TYPES).filter(([k]) => k !== 'chat' || (counts.chat || 0) > 0).map(([k, v]) => (
            <button key={k} onClick={() => setF2('type', k)}
              style={{
                padding: '6px 14px', borderRadius: 99, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                border: `1.5px solid ${lf.type === k ? C.navy : C.border2}`,
                background: lf.type === k ? C.navy : C.glassHi, color: lf.type === k ? '#fff' : C.text2
              }}>{v.label} ({counts[k] || 0})</button>
          ))}
        </div>
      </Card>

      <Card style={{ padding: '16px 20px', marginBottom: 12, background: C.glassHi }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' }}>
            Activity Logs — latest 1000 entries, read-only
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn onClick={exportLogs} variant="outline" size="sm">Export Excel</Btn>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{filtered.length} of {logs.length} entries</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
          <input value={lf.search} onChange={e => setF2('search', e.target.value)}
            placeholder="Search user / ticket / action..." style={sel} />
          <input type="date" value={lf.from} onChange={e => setF2('from', e.target.value)} style={sel} title="From date" />
          <input type="date" value={lf.to} onChange={e => setF2('to', e.target.value)} style={sel} title="To date" />
          <Btn onClick={() => { setLf({ type: '', search: '', from: '', to: '' }); setVisible(50); }} variant="ghost" size="sm" style={{ height: 40 }}>Clear</Btn>
        </div>
      </Card>
      </div>

      <div className="app-fill">
      {!loaded ? (
        <Card style={{ textAlign: 'center', padding: 48 }}><div style={{ color: C.muted }}>Loading logs...</div></Card>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}><div style={{ fontWeight: 600, color: C.muted }}>No log entries match your filters</div></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden', flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.9)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
          <div className="sticky-table" style={{ flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.inset, borderBottom: `2px solid ${C.border}` }}>
                  {['Time', 'Type', 'Action', 'By', 'Ticket', 'Target', 'Details'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: C.muted,
                      letterSpacing: .6, textTransform: 'uppercase', whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, visible).map((l, i) => {
                  const t = LOG_TYPES[l.type] || { label: l.type, color: C.muted, bg: C.off };
                  return (
                    <tr key={l._id} style={{ background: i % 2 === 0 ? C.row1 : C.row2, borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{fmtDT(l.at)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: t.bg, color: t.color, whiteSpace: 'nowrap' }}>{t.label}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{l.action}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12.5, color: C.text2, whiteSpace: 'nowrap' }}>
                        {l.actorName || l.actor}
                        {l.actorName && <div style={{ fontSize: 10.5, color: C.muted }}>{l.actor}</div>}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: C.navy, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{na(l.ticketId)}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: C.text2, whiteSpace: 'nowrap' }}>{na(l.target)}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: C.text2, maxWidth: 360 }}>{na(l.details)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {filtered.length > visible && (
        <div style={{ textAlign: 'center', marginTop: 18, flexShrink: 0 }}>
          <Btn onClick={() => setVisible(v => v + 50)} variant="outline" size="md">Load More ({filtered.length - visible} remaining)</Btn>
        </div>
      )}
      </div>
    </div>
  );
}

function AppShell() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('admin');

  const handleLogin = (u) => {
    setUser(u);
    const perms = deriveUserPerms(u);
    setViewMode(perms.isAdmin ? 'admin' : 'user');
  };
  const handleLogout = () => { if (user) Logger.log('auth', 'LOGOUT', user); setUser(null); };
  const handlePwChanged = (u) => setUser(u);
  const handleUserUpdate = (u) => setUser(u);

  // Only one active session per account: watch our own user document, and if
  // its activeSessionId ever changes to something other than the id we logged
  // in with, someone else has logged into this same account — sign out here.
  const watchUsername = user ? user.username : null;
  const watchSessionId = user ? user._sessionId : null;
  useEffect(() => {
    if (!watchUsername) return;
    const unsub = FireDB.subscribeUserDoc(watchUsername, (data) => {
      if (!data) return;
      if (data.activeSessionId && watchSessionId && data.activeSessionId !== watchSessionId) {
        Logger.log('auth', 'SESSION_ENDED', { username: watchUsername }, { details: 'Signed out because the same account logged in elsewhere' });
        toast.error('You have been logged out because this account was signed in from another device or tab.');
        setUser(null);
      }
    });
    return () => unsub();
  }, [watchUsername, watchSessionId]);

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.firstLogin) return <ChangePasswordPage user={user} onDone={handlePwChanged} onLogout={handleLogout} />;

  const perms = deriveUserPerms(user);

  if (perms.isAdmin && perms.isEmployee) {
    return viewMode === 'admin'
      ? <AdminPortal user={user} onLogout={handleLogout} canSwitch onSwitchView={() => setViewMode('user')} onUserUpdate={handleUserUpdate} />
      : <UserPortal user={user} onLogout={handleLogout} canSwitch onSwitchView={() => setViewMode('admin')} />;
  }
  if (perms.isAdmin) return <AdminPortal user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
  return <UserPortal user={user} onLogout={handleLogout} />;
}

function AppInner() {
  const [themeKey, setThemeKeyState] = useState(() => applyTheme(readSavedTheme()));
  const setKey = (k) => {
    const applied = applyTheme(k);
    try { window.localStorage.setItem(THEME_STORE_KEY, applied); } catch (e) { /* storage unavailable */ }
    setThemeKeyState(applied);
  };
  return (
    <ThemeContext.Provider value={{ key: themeKey, setKey }}>
      <AppShell />
      <ToastHost />
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}