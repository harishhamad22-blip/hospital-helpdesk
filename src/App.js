import { useState, useEffect, useMemo, useRef, Component } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { db } from './firebase';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc
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
  'IT Hardware', 'Network', 'Software', 'Printer', 'PC/Printer Shifting',
  'Electrical', 'AC', 'Air Cooler', 'Air Curtain', 'Water Cooler', 'RO',
  'Fridge/Freezer', 'Mobile/Charger', 'Gas Plant/Cylinder',
  'Furniture Shifting', 'Furniture Repairing', 'Carpenter', 'Painter',
  'Biomedical Equipment', 'Plumber', 'Welding'
];

// Category icons kept — they help employees find the right category quickly.
const TYPE_ICONS = {
  'IT Hardware': '🖥️', 'Network': '🌐', 'Software': '💿', 'Printer': '🖨️',
  'PC/Printer Shifting': '🔄', 'Electrical': '💡', 'AC': '❄️', 'Air Cooler': '🌬️',
  'Air Curtain': '🚪', 'Water Cooler': '🥤', 'RO': '💧', 'Fridge/Freezer': '🧊',
  'Mobile/Charger': '📱', 'Gas Plant/Cylinder': '🔥', 'Furniture Shifting': '🛋️',
  'Furniture Repairing': '🔨', 'Carpenter': '🪚', 'Painter': '🎨',
  'Biomedical Equipment': '🩺', 'Plumber': '🚰', 'Welding': '⚡'
};

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
  open: { label: 'Open', color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  hold: { label: 'Processing', color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  resolved: { label: 'Resolved', color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
  refused: { label: 'Refused', color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
  closed: { label: 'Closed', color: '#374151', bg: '#f3f4f6', dot: '#9ca3af' },
};

// Employee picks this when raising a ticket — lets admins triage at a glance.
// weight is used to sort urgent/unresolved tickets to the top of the list.
const PRIORITY_CFG = {
  low: { label: 'Low', color: '#0f7a3d', bg: '#e4f7ea', weight: 1 },
  medium: { label: 'Medium', color: '#b45309', bg: '#fef3c7', weight: 2 },
  high: { label: 'High', color: '#c0261e', bg: '#fdeaea', weight: 3 },
};
const DEFAULT_PRIORITY = 'medium';

function PriorityBadge({ priority, unresolved = false }) {
  const p = PRIORITY_CFG[priority] || PRIORITY_CFG[DEFAULT_PRIORITY];
  const blink = priority === 'high' && unresolved;
  return (
    <span className={blink ? 'blinkHigh' : ''} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, color: p.color, background: p.bg, letterSpacing: .3
    }}>
      {blink ? '🔴' : '●'} {p.label.toUpperCase()}{blink ? ' PRIORITY' : ''}
    </span>
  );
}

// ── ROLE / PERMISSIONS HELPERS ────────────────────────────────
// Derives a normalized permission object from a user record, whether it was
// saved with the new fields (isEmployee/isAdmin/adminScope/adminCategories)
// or is an older record that only has the legacy `role` string.
const deriveUserPerms = (u) => {
  if (!u) return { isEmployee: false, isAdmin: false, adminScope: 'none', adminCategories: [], isFullAdmin: false };
  if (typeof u.isEmployee === 'boolean' || typeof u.isAdmin === 'boolean') {
    const isAdmin = !!u.isAdmin;
    const adminScope = isAdmin ? (u.adminScope === 'categories' ? 'categories' : 'all') : 'none';
    return {
      isEmployee: !!u.isEmployee,
      isAdmin,
      adminScope,
      adminCategories: Array.isArray(u.adminCategories) ? u.adminCategories : [],
      isFullAdmin: isAdmin && adminScope === 'all'
    };
  }
  // Legacy migration — old records only ever had `role`.
  if (u.role === 'admin') return { isEmployee: false, isAdmin: true, adminScope: 'all', adminCategories: [], isFullAdmin: true };
  if (u.role === 'both') return { isEmployee: true, isAdmin: true, adminScope: 'all', adminCategories: [], isFullAdmin: true };
  return { isEmployee: true, isAdmin: false, adminScope: 'none', adminCategories: [], isFullAdmin: false };
};

const roleSummaryLabel = (perms) => {
  if (!perms.isAdmin) return perms.isEmployee ? 'Employee' : 'No Access';
  const adminPart = perms.adminScope === 'all' ? 'Full Admin' : 'Category Admin';
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

// ── PRINT: full ticket history with resolution time + rating slip ─────
const printComplaint = (c) => {
  const win = window.open('', '_blank', 'width=850,height=1000');
  if (!win) { alert('Please allow pop-ups to print this ticket.'); return; }
  const raisedAt = fmtDT(c.at);
  const resolvedAt = c.actionAt ? fmtDT(c.actionAt) : '—';
  const duration = c.actionAt ? getDuration(c.at, c.actionAt) : '—';
  const ratingRows = RATING_OPTIONS.map(r => `
    <td style="text-align:center;padding:10px 6px;border:1px solid #ccd6e2;">
      <div style="font-size:16px;">${c.rating === r.key ? '[X]' : '[ ]'}</div>
      <div style="font-size:11px;margin-top:4px;color:#33465f;">${r.label}</div>
    </td>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${c.id} - Ticket Print</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
    body { margin: 30px; color: #152a44; }
    .head { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #0b4f43; padding-bottom:14px; margin-bottom:20px; }
    .head h1 { font-size:20px; color:#0b4f43; margin:0; }
    .head p { font-size:12px; color:#68778e; margin:2px 0 0; }
    .ticket-id { font-size:16px; font-weight:700; color:#fff; background:#0b4f43; padding:6px 16px; border-radius:6px; letter-spacing:1px; }
    table.info { width:100%; border-collapse:collapse; margin-bottom:18px; }
    table.info td { border:1px solid #ccd6e2; padding:8px 12px; font-size:13px; }
    table.info td.label { background:#f4f7fb; font-weight:700; width:180px; color:#33465f; }
    .desc-box { border:1px solid #ccd6e2; border-radius:6px; padding:12px; font-size:13px; margin-bottom:18px; line-height:1.6; }
    .section-title { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#68778e; margin:18px 0 8px; }
    table.rating { width:100%; border-collapse:collapse; margin-bottom:22px; }
    .sign-row { display:flex; justify-content:space-between; margin-top:50px; }
    .sign-box { width:45%; border-top:1px solid #333; padding-top:6px; font-size:12px; text-align:center; color:#33465f; }
    .footer-note { font-size:11px; color:#68778e; margin-top:30px; text-align:center; }
    @media print { .no-print { display:none; } }
  </style></head>
  <body>
    <div class="head">
      <div><h1>Choithram Hospital &amp; Research Centre</h1><p>IDAR — Complaint &amp; Request Management System</p></div>
      <div class="ticket-id">${c.id}</div>
    </div>
    <table class="info">
      <tr><td class="label">Category</td><td>${c.type}</td><td class="label">Priority</td><td>${(PRIORITY_CFG[c.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).label}</td></tr>
      <tr><td class="label">Status</td><td colspan="3">${STATUS_CFG[c.status]?.label || c.status}</td></tr>
      <tr><td class="label">Raised By</td><td>${c.userName || ''}</td><td class="label">Employee ID</td><td>${c.empId || '—'}</td></tr>
      <tr><td class="label">Department / Location</td><td colspan="3">${c.dept || ''}</td></tr>
      <tr><td class="label">Raised On (Date &amp; Time)</td><td>${raisedAt}</td><td class="label">Resolved On (Date &amp; Time)</td><td>${resolvedAt}</td></tr>
      <tr><td class="label">Resolution Time Taken</td><td>${duration}</td><td class="label">Resolved By</td><td>${c.actionBy || '—'}</td></tr>
    </table>
    <div class="section-title">Issue / Request Description</div>
    <div class="desc-box">${(c.desc || '').replace(/</g, '&lt;')}</div>
    ${c.solution ? `<div class="section-title">Solution / Action Taken</div><div class="desc-box">${c.solution.replace(/</g, '&lt;')}</div>` : ''}
    ${c.ratingRemark ? `<div class="section-title">Employee Remark (submitted online)</div><div class="desc-box">${c.ratingRemark.replace(/</g, '&lt;')}</div>` : ''}
    <div class="section-title">Employee Satisfaction Rating (please tick one)</div>
    <table class="rating"><tr>${ratingRows}</tr></table>
    <div class="sign-row">
      <div class="sign-box">Employee Signature</div>
      <div class="sign-box">IT / Maintenance Team Signature</div>
    </div>
    <div class="footer-note">Printed on ${fmtDT(now())} · Choithram Hospital &amp; Research Centre — IDAR Ticket System</div>
  </body></html>`;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};

// ── THEME ── Clean professional white theme ────────────────────────────
const C = {
  navy: '#0b4f43', navy2: '#083f36', navy3: '#0e6b57',
  gold: '#12a37f', gold2: '#1ec39a', goldL: '#e3f6ef',
  white: '#ffffff', off: '#f4f8f6', card: '#ffffff',
  border: '#e1e9e6', border2: '#c6d5cf',
  text: '#132621', text2: '#33453f', muted: '#68786f',
  green: '#0f7a3d', greenL: '#e4f7ea',
  yellow: '#b45309', yellowL: '#fef3c7',
  red: '#c0261e', redL: '#fdeaea',
  blue: '#0b4f43', blueL: '#e3f6ef',
  accent: '#0b4f43',
};

const GS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{-webkit-text-size-adjust:100%;}
html,body{width:100%;max-width:100vw;overflow-x:hidden;}
body{background:${C.off};font-family:'DM Sans',sans-serif;color:${C.text};font-size:15px;}
input,select,textarea,button{font-family:'DM Sans',sans-serif;}
img{max-width:100%;height:auto;}
button,select,input,a{touch-action:manipulation;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:#f1f5f9;}
::-webkit-scrollbar-thumb{background:#c8d0e0;border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@keyframes blinkHigh{0%,100%{box-shadow:0 0 0 0 rgba(192,38,30,.55);}50%{box-shadow:0 0 0 5px rgba(192,38,30,0);}}
.blinkHigh{animation:blinkHigh 1.3s ease-in-out infinite;}
.fadeUp{animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both;}
.fadeIn{animation:fadeIn .4s ease both;}
.slideDown{animation:slideDown .22s ease both;}
.pulse{animation:pulse 2.5s infinite;}
@media(max-width:640px){
  .hide-sm{display:none!important;}
  .grid-2{grid-template-columns:1fr!important;}
  .grid-3{grid-template-columns:1fr 1fr!important;}
  body{font-size:14px;}
}
@media(max-width:380px){
  body{font-size:13.5px;}
}
@media(max-width:900px){
  .login-left{display:none!important;}
  .login-right{flex:1 1 100%!important;}
}
@supports(padding:max(0px)){
  body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);}
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
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#132621', marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13.5, color: '#68786f', marginBottom: 18, lineHeight: 1.6 }}>
              This screen hit an unexpected error. Your data is safe — just reload to continue.
            </div>
            <button onClick={() => window.location.reload()} style={{
              background: '#0b4f43', color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}>Reload App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
function Btn({ children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false, type = 'button' }) {
  const vs = {
    primary: { background: `linear-gradient(135deg,${C.navy2},${C.navy3})`, color: '#fff', border: `1px solid ${C.navy}`, boxShadow: '0 2px 8px #0b4f4330' },
    gold: { background: `linear-gradient(135deg,${C.navy3},${C.gold},${C.gold2})`, color: '#fff', border: `1px solid ${C.gold}`, boxShadow: '0 2px 8px #12a37f40', fontWeight: 700 },
    success: { background: `linear-gradient(135deg,#0c5e2f,#0f7a3d)`, color: '#fff', border: 'none', boxShadow: '0 1px 4px #0f7a3d40' },
    danger: { background: `linear-gradient(135deg,#8f1c16,#c0261e)`, color: '#fff', border: 'none', boxShadow: '0 1px 4px #c0261e40' },
    warning: { background: `linear-gradient(135deg,#92400e,#b45309)`, color: '#fff', border: 'none', boxShadow: '0 1px 4px #b4530940' },
    purple: { background: `linear-gradient(135deg,#5b21b6,#7c3aed)`, color: '#fff', border: 'none', boxShadow: '0 1px 4px #7c3aed40' },
    ghost: { background: 'transparent', color: C.muted, border: `1px solid ${C.border2}` },
    outline: { background: 'transparent', color: C.accent, border: `1.5px solid ${C.accent}` },
  };
  const ss = {
    sm: { padding: '6px 14px', fontSize: 12.5, borderRadius: 8 },
    md: { padding: '10px 22px', fontSize: 14, borderRadius: 9 },
    lg: { padding: '14px 30px', fontSize: 16, borderRadius: 11 }
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        ...vs[variant], ...ss[size], fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .55 : 1, transition: 'all .18s', letterSpacing: .2, ...style
      }}>
      {children}
    </button>
  );
}

function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: '0 2px 12px #0b2a2210', ...style }}>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const m = STATUS_CFG[status] || { label: status, color: C.muted, bg: '#f1f5f9', dot: C.muted };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, color: m.color, background: m.bg, letterSpacing: .3
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label.toUpperCase()}
    </span>
  );
}

function StatCard({ icon, label, value, color, bg, onClick, active }) {
  return (
    <div className="fadeUp" onClick={onClick} style={{
      background: C.card, border: `1px solid ${active ? color : C.border}`, borderRadius: 16,
      padding: '24px 26px', flex: '1 1 200px', minWidth: 200, boxShadow: active ? `0 4px 18px ${color}30` : '0 2px 12px #0b2a2208',
      position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default', transition: 'all .15s'
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 90, borderRadius: '0 16px 0 90px', background: bg, opacity: .4 }} />
      <div style={{
        width: 50, height: 50, borderRadius: 13, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16,
        border: `1px solid ${color}22`, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace"
      }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 8, fontWeight: 500, letterSpacing: .3 }}>{label}</div>
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0b2a2280', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)'
    }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fadeUp" style={{
        background: C.card, borderRadius: 20, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 30px 80px #0b2a2240'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(135deg,${C.navy},${C.navy3})`, borderRadius: '20px 20px 0 0'
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', fontFamily: "'Poppins',sans-serif", letterSpacing: .5 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', fontSize: 20, cursor: 'pointer', lineHeight: 1, width: 30, height: 30,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
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
  width: '100%', background: '#f7f8fc', border: `1.5px solid ${C.border}`,
  borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none',
  transition: 'border .15s', lineHeight: 1.4
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
          position: 'absolute', zIndex: 300, background: C.card,
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
              onMouseEnter={e => { if (value !== o) e.currentTarget.style.background = '#f0f4ff'; }}
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

// ── STATUS TIMELINE ───────────────────────────────────────────
function Timeline({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div style={{ position: 'relative' }}>
      {history.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 22 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: STATUS_CFG[h.status]?.dot || C.muted, marginTop: 3,
              boxShadow: `0 0 0 4px ${STATUS_CFG[h.status]?.bg || '#f1f5f9'}`, flexShrink: 0
            }} />
            {i < history.length - 1 && (
              <div style={{
                width: 2, flex: 1, background: `linear-gradient(${STATUS_CFG[h.status]?.dot || C.muted},${C.border})`,
                margin: '5px 0', minHeight: 20
              }} />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge status={h.status} />
                {h.actionBy && (
                  <span style={{
                    fontSize: 11, background: C.navy, color: '#fff', borderRadius: 99,
                    padding: '2px 9px', fontWeight: 600
                  }}>
                    {h.actionBy}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{fmtDT(h.at)}</span>
            </div>
            <div style={{
              background: STATUS_CFG[h.status]?.bg || C.off, borderRadius: 10, padding: '10px 13px',
              border: `1px solid ${STATUS_CFG[h.status]?.dot || C.border}22`
            }}>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{h.note}</div>
              {h.by && <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontWeight: 600 }}>Submitted by: {h.by}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ENTERPRISE TOP NAVBAR ──────────────────────────────────────
function TopBar({ subtitle, roleLabel, user, onLogout, tabs, activeTab, onTabChange, tabBadges = {}, maxWidth = 1100, extraActions = null }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 14px #0b4f4330' }}>
      {/* Row 1 — brand navbar */}
      <div style={{ background: `linear-gradient(90deg,${C.navy2},${C.navy3})` }}>
        <div style={{
          maxWidth, margin: '0 auto', padding: '10px 16px', minHeight: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', rowGap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, background: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
            }}>
              <img src={chrclogo} alt="Logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: "'Poppins',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '52vw' }}>
                CHRC IDAR TICKET SYSTEM
              </div>
              <div className="hide-sm" style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: .3 }}>{subtitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', rowGap: 8 }}>
            {extraActions}
            <div className="hide-sm" style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)',
              borderRadius: 99, padding: '4px 12px 4px 4px'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: C.gold, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700
              }}>{(user.displayName || '?').charAt(0).toUpperCase()}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user.displayName}</span>
            </div>
            <Btn onClick={onLogout} variant="ghost" size="sm"
              style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>Logout</Btn>
          </div>
        </div>
      </div>
      {/* Row 2 — status strip */}
      <div style={{ background: '#eef3fa', borderBottom: `1px solid ${C.border2}` }}>
        <div style={{
          maxWidth, margin: '0 auto', padding: '6px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 10, flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: 11, color: C.muted, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span><strong style={{ color: C.text2 }}>Choithram Hospital &amp; Research Centre</strong></span>
            <span className="hide-sm">{user.displayName} ({user.username})</span>
            <span className="hide-sm">{roleLabel}</span>
          </div>
          <div style={{ fontSize: 11, color: '#0f7a3d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0f7a3d', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Logged In
          </div>
        </div>
      </div>
      {/* Row 3 — tabs */}
      {tabs && (
        <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 2, overflowX: 'auto' }}>
            {tabs.map(([k, l]) => (
              <button key={k} onClick={() => onTabChange(k)}
                style={{
                  padding: '13px 20px', background: 'none', border: 'none', whiteSpace: 'nowrap',
                  borderBottom: `2.5px solid ${activeTab === k ? C.gold : 'transparent'}`,
                  color: activeTab === k ? C.navy : C.muted,
                  fontWeight: activeTab === k ? 700 : 600, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s'
                }}>
                {l}
                {tabBadges[k] > 0 && (
                  <span style={{
                    background: C.gold, color: '#fff', borderRadius: 99,
                    fontSize: 10, padding: '1px 7px', marginLeft: 6, fontWeight: 700
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
      if (!u) { setError('Username not found'); setLoading(false); return; }
      if (u.password !== password) { setError('Incorrect password'); setLoading(false); return; }
      // Single-session enforcement: this login becomes the only valid session
      // for this account — any other tab/device logged in as this user will
      // be signed out automatically as soon as it sees the new session id.
      const sid = genSessionId();
      await FireDB.updateUser(u.username, { activeSessionId: sid });
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
      setFpSuccess('Password changed successfully! You can now login.');
      setFpUsername(''); setFpNew1(''); setFpNew2('');
    } catch (e) {
      setFpError('Failed to reset password. Please try again.');
    }
    setFpLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#eef1f8', position: 'relative' }}>
      <style>{GS}</style>

      {/* ── LEFT — brand / slider panel ── */}
      <div className="login-left" style={{
        flex: '1 1 58%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', padding: '30px 44px'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: .5, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${C.border2} 1px, transparent 1px)`,
          backgroundSize: '22px 22px'
        }} />
        <div style={{
          position: 'absolute', top: -120, right: -120, width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle,${C.goldL},transparent 70%)`, pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          <div style={{
            fontSize: 30, fontWeight: 900, color: '#0b4f43', letterSpacing: -0.5,
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
        padding: '24px 20px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)',
        borderLeft: '1px solid rgba(11,79,67,0.08)'
      }}>
        <div className="fadeUp" style={{ width: '100%', maxWidth: 380 }}>
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
                  style={{ ...inputStyle, background: '#fff', border: `1.5px solid ${C.border2}` }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ ...inputStyle, background: '#fff', border: `1.5px solid ${C.border2}`, paddingRight: 52 }} />
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
                  style={{ ...inputStyle, background: '#fff', border: `1.5px solid ${C.border2}` }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>New Password</label>
                <input type="password" value={fpNew1} onChange={e => setFpNew1(e.target.value)}
                  placeholder="Minimum 3 characters" style={{ ...inputStyle, background: '#fff', border: `1.5px solid ${C.border2}` }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 6 }}>Confirm New Password</label>
                <input type="password" value={fpNew2} onChange={e => setFpNew2(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  style={{ ...inputStyle, background: '#fff', border: `1.5px solid ${C.border2}` }} />
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
    onDone({ ...user, password: form.new1, firstLogin: false });
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: `linear-gradient(180deg,#ffffff 0%,${C.off} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <style>{GS}</style>
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
        <div style={{ background: '#fff', borderRadius: 18, padding: 26, boxShadow: `0 16px 44px ${C.navy}14`, border: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>New Password</FieldLabel>
            <input type="password" value={form.new1} onChange={e => f('new1', e.target.value)}
              placeholder="Minimum 3 characters" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Confirm Password</FieldLabel>
            <input type="password" value={form.new2} onChange={e => f('new2', e.target.value)}
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
  const [lastTicket, setLastTicket] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [histFilters, setHistFilters] = useState({ from: '', to: '', status: '', search: '' });
  const [histVisibleCount, setHistVisibleCount] = useState(30);
  const sf = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const hf = (k, v) => { setHistFilters(s => ({ ...s, [k]: v })); setHistVisibleCount(30); };

  const [ratingRemarkDraft, setRatingRemarkDraft] = useState('');
  const [remarkSaved, setRemarkSaved] = useState(false);

  const rateTicket = async (c, key) => {
    await FireDB.updateComplaint(c._docId, { rating: key });
    if (selected && selected._docId === c._docId) setSelected(s => ({ ...s, rating: key }));
  };

  const saveRatingRemark = async (c) => {
    await FireDB.updateComplaint(c._docId, { ratingRemark: ratingRemarkDraft.trim() });
    if (selected && selected._docId === c._docId) setSelected(s => ({ ...s, ratingRemark: ratingRemarkDraft.trim() }));
    setRemarkSaved(true);
    setTimeout(() => setRemarkSaved(false), 2000);
  };

  useEffect(() => {
    setRatingRemarkDraft(selected ? (selected.ratingRemark || '') : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected && selected._docId]);

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
      alert('Please fill all required fields'); return;
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
    await sendWhatsAppAlert(ticket);
    setLastTicket(ticket);
    setForm({ empId: '', dept: '', type: '', priority: DEFAULT_PRIORITY, desc: '' });
    setSubmitting(false);
    setTab('status');
  };

  const sortedComplaints = useMemo(() =>
    [...myComplaints].sort((a, b) => new Date(b.at) - new Date(a.at)),
    [myComplaints]);
  const recentComplaints = sortedComplaints.slice(0, 5);

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
      case 'open': return { msg: 'Your ticket has been received. Our team will respond soon.', color: C.blue, bg: C.blueL };
      case 'hold': return { msg: `Processing: ${c.holdReason || 'Being reviewed by the concerned team.'}`, color: C.yellow, bg: C.yellowL };
      case 'resolved': return { msg: `Resolved by ${c.actionBy || 'IT Team'}. Solution: ${c.solution || '—'}`, color: C.green, bg: C.greenL };
      case 'refused': return { msg: `Refused. Reason: ${c.refuseReason || '—'}`, color: C.red, bg: C.redL };
      case 'closed': return c.solution
        ? { msg: `Resolved & closed by ${c.actionBy || 'IT Team'}. Solution: ${c.solution}`, color: C.green, bg: C.greenL }
        : { msg: 'This ticket has been closed.', color: C.muted, bg: C.off };
      default: return null;
    }
  };

  const renderTicketCard = (c) => {
    const statusMsg = getStatusMessage(c);
    return (
      <Card key={c._docId || c.id} style={{ padding: 22, cursor: 'pointer', transition: 'all .2s' }}
        onClick={() => setSelected(c)}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px #0b2a2218'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px #0b2a2210'; e.currentTarget.style.transform = 'none'; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
              color: C.navy, fontWeight: 700, marginBottom: 4, letterSpacing: 1,
              background: C.goldL, padding: '3px 10px', borderRadius: 6,
              border: `1px solid ${C.gold}`, display: 'inline-block'
            }}>{c.id}</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.text, marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
              {c.type}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {c.dept} &nbsp;·&nbsp; {fmtDT(c.at)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Badge status={c.status} />
            <PriorityBadge priority={c.priority} unresolved={c.status === 'open' || c.status === 'hold'} />
          </div>
        </div>
        <div style={{
          background: C.off, borderRadius: 10, padding: '10px 14px',
          fontSize: 13, color: C.text2, lineHeight: 1.6, border: `1px solid ${C.border}`, marginBottom: 10
        }}>
          {c.desc.length > 120 ? c.desc.substring(0, 120) + '…' : c.desc}
        </div>
        {statusMsg && (
          <div style={{
            padding: '10px 14px', background: statusMsg.bg, borderRadius: 10,
            fontSize: 13, color: statusMsg.color, fontWeight: 500,
            border: `1px solid ${statusMsg.color}22`
          }}>
            {statusMsg.msg}
            {c.actionBy && c.status !== 'open' && (
              <span style={{ display: 'block', fontSize: 11, marginTop: 4, opacity: .8 }}>
                Action by: <strong>{c.actionBy}</strong>
              </span>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: C.off }}>
      <style>{GS}</style>
      <TopBar
        subtitle="Employee Portal — Complaint & Request System"
        roleLabel="Employee"
        user={user}
        onLogout={onLogout}
        tabs={[['form', 'New Ticket'], ['status', 'My Tickets']]}
        activeTab={tab}
        onTabChange={setTab}
        tabBadges={{ status: myComplaints.length }}
        maxWidth={1300}
        extraActions={canSwitch ? (
          <Btn onClick={onSwitchView} variant="ghost" size="sm" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            Switch to Admin View
          </Btn>
        ) : null}
      />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px' }}>
        {/* NEW TICKET FORM */}
        {tab === 'form' && (
          <div className="fadeUp">
            {lastTicket && (
              <div style={{
                background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                border: `2px solid ${C.green}`, borderRadius: 16, padding: 22, marginBottom: 22,
                display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 16px #0f7a3d20'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: C.green, fontFamily: "'Poppins',sans-serif" }}>
                    Ticket Submitted Successfully
                  </div>
                  <div style={{ color: C.text2, fontSize: 13, marginTop: 6 }}>Your Ticket ID:</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700,
                    color: C.navy, marginTop: 4, letterSpacing: 1.5,
                    background: C.goldL, padding: '6px 14px', borderRadius: 8,
                    display: 'inline-block', border: `1px solid ${C.gold}`
                  }}>{lastTicket.id}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
                    Save this Ticket ID to track your ticket status.
                  </div>
                  <div style={{ fontSize: 12, color: C.green, marginTop: 6, fontWeight: 600 }}>
                    Our team will respond soon. You can track status in "My Tickets" tab.
                  </div>
                </div>
              </div>
            )}
            <Card style={{ padding: 36 }}>
              <div style={{ marginBottom: 26, paddingBottom: 22, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 4, height: 30, background: `linear-gradient(${C.navy},${C.gold})`, borderRadius: 2 }} />
                  <h2 style={{ fontWeight: 700, fontSize: 23, color: C.text, fontFamily: "'Poppins',sans-serif" }}>
                    Raise a New Ticket
                  </h2>
                </div>
                <p style={{ color: C.muted, fontSize: 14, marginLeft: 14 }}>
                  Fill all fields carefully. Your ticket will be assigned immediately.
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

              <div style={{ marginBottom: 20 }}>
                <FieldLabel required>Category</FieldLabel>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
                  gap: 18, background: C.off, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22
                }}>
                  {COMPLAINT_TYPES.map(t => {
                    const sel = form.type === t;
                    return (
                      <button key={t} onClick={() => sf('type', t)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                          padding: '14px 6px', borderRadius: 12, cursor: 'pointer', border: 'none',
                          background: 'transparent'
                        }}>
                        <div style={{
                          width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 36,
                          background: sel ? `linear-gradient(135deg,${C.navy2},${C.navy3})` : C.blueL,
                          border: `2px solid ${sel ? C.navy : '#d7e6f7'}`,
                          boxShadow: sel ? '0 4px 14px #0b4f4340' : 'none', transition: 'all .15s'
                        }}>{TYPE_ICONS[t]}</div>
                        <div style={{
                          fontSize: 14, textAlign: 'center', lineHeight: 1.3, fontWeight: sel ? 700 : 500,
                          color: sel ? C.navy : C.text2
                        }}>{t}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <FieldLabel required>Priority</FieldLabel>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {Object.entries(PRIORITY_CFG).map(([key, p]) => {
                    const sel = form.priority === key;
                    return (
                      <button key={key} onClick={() => sf('priority', key)}
                        style={{
                          flex: '1 1 140px', padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                          border: `2px solid ${sel ? p.color : C.border2}`, background: sel ? p.bg : '#fff',
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

              <div style={{
                background: C.blueL, borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                border: `1px solid #bfdbfe`, fontSize: 13, color: C.blue
              }}>
                <strong>Note:</strong> The concerned team will respond to your ticket as soon as possible.
              </div>

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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite', display: 'inline-block' }} />
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
                <div style={{ display: 'grid', gap: 14 }}>
                  {recentComplaints.map(renderTicketCard)}
                </div>
                {sortedComplaints.length > 5 && (
                  <div style={{ textAlign: 'center', marginTop: 18 }}>
                    <Btn onClick={() => setHistoryOpen(true)} variant="outline" size="md">
                      View All Previous Tickets ({sortedComplaints.length})
                    </Btn>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Ticket History Modal — last 5 shown above, full searchable history here */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="All My Previous Tickets" width={720}>
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
          {historyFiltered.length} of {sortedComplaints.length} tickets — pick a date range (e.g. last month, last year) or search to find an older ticket.
        </div>
        {historyFiltered.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 30 }}>No tickets match these filters</div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: 10, maxHeight: 460, overflow: 'auto' }}>
              {historyFiltered.slice(0, histVisibleCount).map(c => (
                <div key={c._docId || c.id} onClick={() => { setSelected(c); setHistoryOpen(false); }}
                  style={{
                    border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap'
                  }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: C.navy, fontWeight: 700 }}>{c.id}</span>
                      <Badge status={c.status} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.type}</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>{c.dept} · {fmtDT(c.at)}</div>
                  </div>
                </div>
              ))}
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

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}
        title={`${selected?.id} — Full Details`} width={580}>
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }} className="grid-2">
              {[
                ['Ticket ID', selected.id, C.navy, true],
                ['Current Status', STATUS_CFG[selected.status]?.label, STATUS_CFG[selected.status]?.color, false],
                ['Priority', (PRIORITY_CFG[selected.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).label, (PRIORITY_CFG[selected.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).color, false],
                ['Employee ID', selected.empId || '—', C.text, false],
                ['Department/Location', selected.dept, C.text, false],
                ['Category', selected.type, C.text, false],
                ['Submitted On', fmtDT(selected.at), C.muted, false],
                ...(selected.status === 'resolved' || selected.status === 'closed' ? [
                  ['Resolved By', selected.actionBy || '—', C.green, false],
                  ['Resolved On', fmtDT(selected.actionAt) || '—', C.green, false],
                  ['Time Taken to Resolve', getDuration(selected.at, selected.actionAt), C.green, true],
                ] : [])
              ].map(([k, v, c, mono]) => (
                <div key={k} style={{ background: C.off, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: .6, marginBottom: 4, textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.off, borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: .6, marginBottom: 6, textTransform: 'uppercase' }}>Issue Description</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.7 }}>{selected.desc}</div>
            </div>
            {selected.solution && (
              <div style={{ background: C.greenL, borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: `1px solid #a7f3d0` }}>
                <div style={{ fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: .6, marginBottom: 6, textTransform: 'uppercase' }}>Solution Applied</div>
                <div style={{ fontSize: 13, color: C.green, lineHeight: 1.6, fontWeight: 500 }}>{selected.solution}</div>
              </div>
            )}
            <div style={{ background: C.blueL, borderRadius: 10, padding: '10px 14px', marginBottom: 18, border: `1px solid #bfdbfe` }}>
              <div style={{ fontSize: 13, color: C.blue }}>
                The concerned team is working on your ticket. Thank you for your patience.
              </div>
            </div>
            <div style={{
              fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 14, letterSpacing: .6,
              textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, paddingBottom: 10
            }}>
              Status History Timeline
            </div>
            <Timeline history={selected.history} />

            {(selected.status === 'resolved' || selected.status === 'closed') && (
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 10, letterSpacing: .6, textTransform: 'uppercase' }}>
                  Rate this resolution
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {RATING_OPTIONS.map(r => (
                    <button key={r.key} onClick={() => rateTicket(selected, r.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99,
                        cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        border: `2px solid ${selected.rating === r.key ? r.color : C.border}`,
                        background: selected.rating === r.key ? `${r.color}18` : '#fff',
                        color: selected.rating === r.key ? r.color : C.text2
                      }}>
                      {r.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel>Remark (optional)</FieldLabel>
                  <textarea value={ratingRemarkDraft} onChange={e => setRatingRemarkDraft(e.target.value)}
                    rows={2} placeholder="Anything you'd like to add about how this was resolved..."
                    style={{ ...inputStyle, resize: 'vertical' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <Btn onClick={() => saveRatingRemark(selected)} variant="outline" size="sm">Save Remark</Btn>
                    {remarkSaved && <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Saved ✓</span>}
                  </div>
                </div>
                <Btn onClick={() => printComplaint(selected)} variant="outline" size="sm">Print Ticket / Resolution Slip</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
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
  const [filters, setFilters] = useState({ dept: '', type: '', status: 'open', priority: '', search: '', from: '', to: '' });
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(null);
  const [addUserModal, setAddUserModal] = useState(false);
  // userType: 'employee' | 'categoryAdmin' | 'fullAdmin'.
  // alsoEmployee only matters for the two admin types — it additionally lets
  // that person raise their own tickets and switch between Employee/Admin views.
  const [newUser, setNewUser] = useState({ username: '', displayName: '', password: '', userType: 'employee', alsoEmployee: false, adminCategories: [] });
  const [addUserError, setAddUserError] = useState('');
  const [permModal, setPermModal] = useState(null);
  const [permForm, setPermForm] = useState({ displayName: '', userType: 'employee', alsoEmployee: false, adminCategories: [] });
  const [permError, setPermError] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const af = (k, v) => setActionForm(s => ({ ...s, [k]: v }));
  const setF = (k, v) => { setFilters(s => ({ ...s, [k]: v })); setVisibleCount(20); };
  const nu = (k, v) => setNewUser(s => ({ ...s, [k]: v }));
  const pf = (k, v) => setPermForm(s => ({ ...s, [k]: v }));

  useEffect(() => {
    const unsub1 = FireDB.subscribeComplaints(data => setComplaints(data));
    const loadUsers = async () => {
      const u = await FireDB.getUsers();
      if (u) setUsers(u);
    };
    loadUsers();
    return () => { unsub1(); };
  }, []);

  // Department-wise scoping: a Full Admin sees every ticket; a category-limited
  // admin only sees tickets whose category is in their assigned list.
  const scopedComplaints = useMemo(() => {
    if (perms.adminScope === 'all') return complaints;
    if (perms.adminScope === 'categories') return complaints.filter(c => perms.adminCategories.includes(c.type));
    return [];
  }, [complaints, perms.adminScope, perms.adminCategories]);

  const scopedTypes = perms.adminScope === 'categories' ? COMPLAINT_TYPES.filter(t => perms.adminCategories.includes(t)) : COMPLAINT_TYPES;

  const deptOptionsInScope = useMemo(() => {
    const set = new Set(scopedComplaints.map(c => c.dept).filter(Boolean));
    return Array.from(set).sort();
  }, [scopedComplaints]);

  // Category-wise counts within the current status filter — lets an admin
  // (especially a Full Admin watching every department) quickly jump to a
  // specific category's tickets when a lot of tickets are coming in.
  const categoryCounts = useMemo(() => {
    const base = filters.status ? scopedComplaints.filter(c => c.status === filters.status) : scopedComplaints;
    return scopedTypes
      .map(t => ({ type: t, count: base.filter(c => c.type === t).length }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [scopedComplaints, scopedTypes, filters.status]);

  const markNotificationsSeen = async () => {
    const ts = now();
    await FireDB.updateUser(user.username, { lastSeenAt: ts });
    onUserUpdate && onUserUpdate({ ...user, lastSeenAt: ts });
  };

  const newTickets = useMemo(() => {
    const lastSeenAt = user.lastSeenAt || null;
    return scopedComplaints
      .filter(c => !lastSeenAt || new Date(c.at) > new Date(lastSeenAt))
      .sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [scopedComplaints, user.lastSeenAt]);

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
        new Notification(`New Ticket — ${c.id}`, { body: `${c.type} · ${c.dept}\n${c.userName}` });
      } else {
        new Notification(`${arrived.length} New Tickets`, { body: 'Open the admin portal to view them.' });
      }
    } catch (e) { console.warn('Desktop notification failed:', e); }
  }, [scopedComplaints, notifSupported, notifPermission]);

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
      if (filters.dept && c.dept !== filters.dept) return false;
      if (filters.type && c.type !== filters.type) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.priority && c.priority !== filters.priority) return false;
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
    setActionForm({ actionBy: '', solution: '', reason: '' });
  };

  const doAction = async () => {
    const c = actionModal;
    const type = actionType;
    let newStatus = '', histEntries = [], updateData = {};

    if (type === 'resolve') {
      if (!actionForm.actionBy.trim() || !actionForm.solution.trim()) { alert('Fill all fields'); return; }
      // Resolving a ticket automatically closes it
      newStatus = 'closed';
      histEntries = [
        {
          status: 'resolved', at: now(), by: '', actionBy: actionForm.actionBy,
          note: `Issue resolved. Solution: ${actionForm.solution}`
        },
        {
          status: 'closed', at: now(), by: '', actionBy: actionForm.actionBy,
          note: 'Ticket automatically closed after resolution.'
        }
      ];
      updateData = { actionBy: actionForm.actionBy, solution: actionForm.solution, actionAt: now() };
    } else if (type === 'hold') {
      if (!actionForm.reason.trim()) { alert('Please enter a reason'); return; }
      newStatus = 'hold';
      histEntries = [{
        status: 'hold', at: now(), by: '', actionBy: user.displayName,
        note: `Ticket is being processed. Reason: ${actionForm.reason}`
      }];
      updateData = { holdReason: actionForm.reason };
    } else if (type === 'refuse') {
      if (!actionForm.reason.trim()) { alert('Please enter refusal reason'); return; }
      newStatus = 'refused';
      histEntries = [{
        status: 'refused', at: now(), by: '', actionBy: user.displayName,
        note: `Ticket refused. Reason: ${actionForm.reason}`
      }];
      updateData = { refuseReason: actionForm.reason };
    } else if (type === 'close') {
      newStatus = 'closed';
      histEntries = [{
        status: 'closed', at: now(), by: '', actionBy: user.displayName,
        note: actionForm.reason ? `Ticket closed. Note: ${actionForm.reason}` : 'Ticket closed.'
      }];
    }

    await FireDB.updateComplaint(c._docId, {
      status: newStatus,
      history: [...(c.history || []), ...histEntries],
      ...updateData
    });
    setActionModal(null);
    setDetailModal(null);
  };

  const handleDelete = async (complaint) => {
    await FireDB.deleteComplaint(complaint._docId);
    setDeleteConfirm(null);
    setDetailModal(null);
  };

  const handleDeleteUser = async (u) => {
    if (safeLC(u.username) === safeLC(user.username)) {
      alert("You can't remove the account you're currently logged in as.");
      setDeleteUserConfirm(null);
      return;
    }
    await FireDB.deleteUser(u.username);
    setUsers(prev => prev.filter(x => x.username !== u.username));
    setDeleteUserConfirm(null);
  };

  const toggleCategoryIn = (listSetter, list, cat) => {
    listSetter(list.includes(cat) ? list.filter(x => x !== cat) : [...list, cat]);
  };

  // Turns the simple "userType + alsoEmployee + categories" choice into the
  // underlying isEmployee/isAdmin/adminScope/adminCategories + legacy role fields.
  const buildAccessFields = (userType, alsoEmployee, adminCategories) => {
    if (userType === 'fullAdmin') {
      return { isEmployee: !!alsoEmployee, isAdmin: true, adminScope: 'all', adminCategories: [], role: alsoEmployee ? 'both' : 'admin' };
    }
    if (userType === 'categoryAdmin') {
      return { isEmployee: !!alsoEmployee, isAdmin: true, adminScope: 'categories', adminCategories, role: alsoEmployee ? 'both' : 'admin' };
    }
    return { isEmployee: true, isAdmin: false, adminScope: 'none', adminCategories: [], role: 'user' };
  };

  const handleAddUser = async () => {
    setAddUserError('');
    if (!newUser.username.trim()) { setAddUserError('Username is required'); return; }
    if (!newUser.displayName.trim()) { setAddUserError('Display name is required'); return; }
    if (!newUser.password.trim() || newUser.password.length < 3) { setAddUserError('Password must be at least 3 characters'); return; }
    if (newUser.userType === 'categoryAdmin' && newUser.adminCategories.length === 0) {
      setAddUserError('Select at least one category for this admin, or choose Full Admin'); return;
    }
    const clean = newUser.username.trim().toLowerCase().replace(/\s+/g, '.');
    if (users.find(u => safeLC(u.username) === clean)) { setAddUserError('Username already exists'); return; }
    const access = buildAccessFields(newUser.userType, newUser.alsoEmployee, newUser.adminCategories);
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
      setAddUserModal(false);
      setNewUser({ username: '', displayName: '', password: '', userType: 'employee', alsoEmployee: false, adminCategories: [] });
      alert(`User "${clean}" added successfully!`);
    } else {
      setAddUserError('Failed to add user. Please try again.');
    }
  };

  const openPermModal = (u) => {
    const p = deriveUserPerms(u);
    const userType = p.isAdmin ? (p.adminScope === 'categories' ? 'categoryAdmin' : 'fullAdmin') : 'employee';
    setPermForm({ displayName: u.displayName || '', userType, alsoEmployee: p.isAdmin ? p.isEmployee : false, adminCategories: p.adminCategories });
    setPermError('');
    setPermModal(u);
  };

  const saveUserPermissions = async () => {
    setPermError('');
    if (!permForm.displayName.trim()) { setPermError('Display name cannot be empty'); return; }
    if (permForm.userType === 'categoryAdmin' && permForm.adminCategories.length === 0) {
      setPermError('Select at least one category, or choose Full Admin'); return;
    }
    const access = buildAccessFields(permForm.userType, permForm.alsoEmployee, permForm.adminCategories);
    const data = { displayName: permForm.displayName.trim(), ...access };
    await FireDB.updateUser(permModal.username, data);
    setUsers(prev => prev.map(u => u.username === permModal.username ? { ...u, ...data } : u));
    setPermModal(null);
  };

  const exportExcel = () => {
    const hdr = [
      'Ticket ID', 'Priority', 'Employee Name', 'Employee ID', 'Department/Location', 'Category',
      'Description', 'Status', 'Rating', 'Rating Remark', 'Raised On', 'Resolved On', 'Time Taken to Resolve',
      'Resolved By', 'Solution', 'Processing Note', 'Refused Reason'
    ];
    const ratingLabel = key => RATING_OPTIONS.find(r => r.key === key)?.label || '';
    const priorityLabel = key => (PRIORITY_CFG[key] || PRIORITY_CFG[DEFAULT_PRIORITY]).label;
    const rows = filtered.map(c => [
      c.id,
      priorityLabel(c.priority),
      c.userName || '',
      c.empId || '',
      c.dept || '',
      c.type || '',
      c.desc || '',
      STATUS_CFG[c.status]?.label || c.status || '',
      ratingLabel(c.rating),
      c.ratingRemark || '',
      fmtDT(c.at),
      c.actionAt ? fmtDT(c.actionAt) : '',
      c.actionAt ? getDuration(c.at, c.actionAt) : '',
      c.actionBy || '',
      c.solution || '',
      c.holdReason || '',
      c.refuseReason || ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([hdr, ...rows]);
    ws['!cols'] = [
      { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 24 }, { wch: 18 },
      { wch: 42 }, { wch: 12 }, { wch: 12 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 14 },
      { wch: 18 }, { wch: 32 }, { wch: 22 }, { wch: 22 }
    ];
    const wb = XLSX.utils.book_new();
    const sheetName = perms.adminScope === 'categories' ? `Tickets (${perms.adminCategories.join(', ')})`.slice(0, 31) : 'Tickets';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const scopeTag = perms.adminScope === 'categories' ? `_${perms.adminCategories.join('-')}` : '';
    XLSX.writeFile(wb, `CHRC_IDAR_Tickets${scopeTag}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const changeAdminPw = async () => {
    if (newAdminPw.pw1.length < 3) { alert('Min 3 characters'); return; }
    if (newAdminPw.pw1 !== newAdminPw.pw2) { alert("Passwords don't match"); return; }
    await FireDB.updateUser(user.username, { password: newAdminPw.pw1 });
    setPwModal(false); setNewAdminPw({ pw1: '', pw2: '' });
    alert('Password changed successfully!');
  };

  const resetUserPw = async () => {
    if (!newPwForUser.trim()) { alert('Enter new password'); return; }
    await FireDB.updateUser(resetPwModal.username, { password: newPwForUser, firstLogin: true });
    setResetPwModal(null); setNewPwForUser('');
    alert(`Password reset for ${resetPwModal.username}!`);
  };

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

  const CHART_COLORS = ['#0b4f43', '#12a37f', '#059669', '#dc2626', '#7c3aed'];

  const filteredUsers = useMemo(() =>
    users.filter(u => safeLC(u.username).includes(userSearch.toLowerCase()) ||
      safeLC(u.displayName).includes(userSearch.toLowerCase()))
    , [users, userSearch]);

  const TABS = perms.adminScope === 'all'
    ? [['complaints', 'Tickets'], ['analytics', 'Analytics'], ['users', 'Users']]
    : [['complaints', 'Tickets'], ['analytics', 'Analytics']];

  const selectStyle = { ...inputStyle, fontSize: 12, padding: '9px 12px', height: 40 };

  const getActionButtons = (c, inModal = false) => {
    const close = inModal ? () => { openAction(c, 'close'); setDetailModal(null); }
      : () => openAction(c, 'close');
    const resolve = inModal ? () => { openAction(c, 'resolve'); setDetailModal(null); }
      : () => openAction(c, 'resolve');
    const hold = inModal ? () => { openAction(c, 'hold'); setDetailModal(null); }
      : () => openAction(c, 'hold');
    const refuse = inModal ? () => { openAction(c, 'refuse'); setDetailModal(null); }
      : () => openAction(c, 'refuse');

    if (c.status === 'open' || c.status === 'hold') {
      return (
        <>
          <Btn onClick={resolve} variant="success" size="sm">Resolve</Btn>
          {c.status === 'open' && <Btn onClick={hold} variant="warning" size="sm">Process</Btn>}
          {c.status === 'hold' && <Btn onClick={close} variant="ghost" size="sm">Close</Btn>}
          <Btn onClick={refuse} variant="danger" size="sm">Refuse</Btn>
        </>
      );
    }
    if (c.status === 'resolved') {
      return (
        <>
          <Btn onClick={close} variant="ghost" size="sm">Close</Btn>
          <Btn onClick={() => printComplaint(c)} variant="outline" size="sm">Print</Btn>
        </>
      );
    }
    if (c.status === 'closed') {
      return <Btn onClick={() => printComplaint(c)} variant="outline" size="sm">Print</Btn>;
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: C.off }}>
      <style>{GS}</style>
      <TopBar
        subtitle="Admin Portal — Complaint & Request Management System"
        roleLabel={perms.adminScope === 'categories' ? `Category Admin — ${perms.adminCategories.join(', ') || 'none selected'}` : roleSummaryLabel(perms)}
        user={user}
        onLogout={onLogout}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        maxWidth={1400}
        extraActions={
          <>
            {notifSupported && notifPermission === 'default' && (
              <Btn onClick={enableDesktopAlerts} variant="ghost" size="sm"
                style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} title="Get a system alert even when this tab isn't focused">
                Enable Alerts
              </Btn>
            )}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(s => !s)}
                style={{
                  position: 'relative', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 16, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} title="Notifications">
                🔔
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
                  position: 'absolute', top: 44, right: 0, width: 320, background: '#fff', borderRadius: 14,
                  boxShadow: '0 20px 50px #0b2a2240', border: `1px solid ${C.border}`, zIndex: 400, overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>New Tickets</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {newTickets.length > 0 && (
                        <button onClick={() => { markNotificationsSeen(); setShowNotif(false); }}
                          style={{ background: 'none', border: 'none', color: C.navy, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotif(false)} title="Close"
                        style={{ background: 'none', border: 'none', color: C.muted, fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 320, overflow: 'auto' }}>
                    {newTickets.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 12.5 }}>No new tickets</div>
                    ) : newTickets.slice(0, 10).map(c => (
                      <div key={c._docId} onClick={() => { setDetailModal(c); setShowNotif(false); setTab('complaints'); }}
                        style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.navy, fontWeight: 700 }}>{c.id}</span>
                          <span style={{ fontSize: 10.5, color: C.muted }}>{fmtDT(c.at)}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.text2, fontWeight: 600, marginTop: 2 }}>{c.type} · {c.dept}</div>
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

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        {perms.adminScope === 'categories' && (
          <div style={{
            background: C.goldL, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: '10px 16px',
            marginBottom: 18, fontSize: 13, color: C.navy
          }}>
            You have admin access for: <strong>{perms.adminCategories.join(', ') || '—'}</strong>. Tickets, analytics and exports below are limited to these categories.
          </div>
        )}

        {/* STATS ROW — click a card to quick-filter the ticket list below by that status */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="A" label="All Tickets" value={stats.total} color={C.navy} bg={C.blueL}
            active={filters.status === ''} onClick={() => { setF('status', ''); setTab('complaints'); }} />
          <StatCard icon="O" label="Open" value={stats.open} color='#1e40af' bg='#dbeafe'
            active={filters.status === 'open'} onClick={() => { setF('status', 'open'); setTab('complaints'); }} />
          <StatCard icon="P" label="Processing" value={stats.hold} color={C.yellow} bg={C.yellowL}
            active={filters.status === 'hold'} onClick={() => { setF('status', 'hold'); setTab('complaints'); }} />
          <StatCard icon="R" label="Resolved/Closed" value={stats.resolved} color={C.green} bg={C.greenL}
            active={filters.status === 'resolved' || filters.status === 'closed'} onClick={() => { setF('status', 'closed'); setTab('complaints'); }} />
          <StatCard icon="X" label="Refused" value={stats.refused} color={C.red} bg={C.redL}
            active={filters.status === 'refused'} onClick={() => { setF('status', 'refused'); setTab('complaints'); }} />
        </div>

        {/* COMPLAINTS TAB */}
        {tab === 'complaints' && (
          <div className="fadeUp">
            {categoryCounts.length > 0 && (
              <Card style={{ padding: '16px 20px', marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>
                  Browse by Category {filters.status ? `— ${STATUS_CFG[filters.status]?.label || filters.status} only` : ''}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => setF('type', '')}
                    style={{
                      padding: '6px 14px', borderRadius: 99, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                      border: `1.5px solid ${filters.type === '' ? C.navy : C.border2}`,
                      background: filters.type === '' ? C.navy : '#fff', color: filters.type === '' ? '#fff' : C.text2
                    }}>All Categories</button>
                  {categoryCounts.map(({ type, count }) => (
                    <button key={type} onClick={() => setF('type', type)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99,
                        cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                        border: `1.5px solid ${filters.type === type ? C.navy : C.border2}`,
                        background: filters.type === type ? C.navy : '#fff', color: filters.type === type ? '#fff' : C.text2
                      }}>
                      <span>{TYPE_ICONS[type]}</span>{type}
                      <span style={{
                        background: filters.type === type ? 'rgba(255,255,255,0.25)' : C.goldL,
                        color: filters.type === type ? '#fff' : C.navy, borderRadius: 99, padding: '1px 7px', fontSize: 11
                      }}>{count}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}
            <Card style={{ padding: 22, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' }}>
                  Filter &amp; Search — showing: {filters.status ? (STATUS_CFG[filters.status]?.label || filters.status) : 'All statuses'}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Btn onClick={exportExcel} variant="outline" size="sm">Export Excel</Btn>
                  <span style={{ fontSize: 12, color: C.muted, alignSelf: 'center', fontWeight: 600 }}>
                    {filtered.length} of {scopedComplaints.length} records
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
                <input value={filters.search} onChange={e => setF('search', e.target.value)}
                  placeholder="Search name / ID / issue..."
                  style={{ ...inputStyle, fontSize: 12, padding: '9px 12px', height: 40 }} />
                <select value={filters.status} onChange={e => setF('status', e.target.value)} style={selectStyle}>
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filters.type} onChange={e => setF('type', e.target.value)} style={selectStyle}>
                  <option value="">All Categories</option>
                  {scopedTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filters.priority} onChange={e => setF('priority', e.target.value)} style={selectStyle}>
                  <option value="">All Priorities</option>
                  {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filters.dept} onChange={e => setF('dept', e.target.value)} style={selectStyle}>
                  <option value="">All Departments/Locations</option>
                  {deptOptionsInScope.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="date" value={filters.from} onChange={e => setF('from', e.target.value)}
                  style={selectStyle} title="From date" />
                <input type="date" value={filters.to} onChange={e => setF('to', e.target.value)}
                  style={selectStyle} title="To date" />
                <Btn onClick={() => { setFilters({ dept: '', type: '', status: '', priority: '', search: '', from: '', to: '' }); setVisibleCount(20); }}
                  variant="ghost" size="sm" style={{ height: 40 }}>Clear</Btn>
              </div>
            </Card>

            {filtered.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontWeight: 600, color: C.muted }}>No tickets match your filters</div>
              </Card>
            ) : (
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.off, borderBottom: `2px solid ${C.border}` }}>
                        {['Priority', 'Ticket', 'Employee', 'Category', 'Department/Location', 'Status', 'Submitted', ''].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: C.muted,
                            letterSpacing: .6, textTransform: 'uppercase', whiteSpace: 'nowrap'
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, visibleCount).map((c, i) => {
                        const unresolved = c.status === 'open' || c.status === 'hold';
                        return (
                          <tr key={c._docId || c.id} onClick={() => setDetailModal(c)}
                            style={{
                              background: i % 2 === 0 ? '#fff' : C.off, borderBottom: `1px solid ${C.border}`,
                              cursor: 'pointer', transition: 'background .12s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.blueL; }}
                            onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? '#fff' : C.off; }}>
                            <td style={{ padding: '12px 16px' }}>
                              <PriorityBadge priority={c.priority} unresolved={unresolved} />
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.navy, fontWeight: 700,
                                letterSpacing: .5, background: C.goldL, padding: '3px 9px', borderRadius: 6, border: `1px solid ${C.gold}`
                              }}>{c.id}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{c.userName}</div>
                              {c.empId && <div style={{ fontSize: 11, color: C.muted }}>{c.empId}</div>}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: C.text2, whiteSpace: 'nowrap' }}>
                              {TYPE_ICONS[c.type]} {c.type}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: C.text2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.dept}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <Badge status={c.status} />
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                              {fmtDT(c.at)}
                            </td>
                            <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
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
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <Btn onClick={() => setVisibleCount(v => v + 20)} variant="outline" size="md">
                  Load More ({filtered.length - visibleCount} remaining)
                </Btn>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="fadeUp">
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
                      <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
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
                        {typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
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
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
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
          <div className="fadeUp">
            <Card style={{ padding: 22, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: C.text, fontFamily: "'Poppins',sans-serif" }}>User Management</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, alignSelf: 'center' }}>{filteredUsers.length} users</span>
                  <Btn onClick={() => { setAddUserModal(true); setAddUserError(''); setNewUser({ username: '', displayName: '', password: '', userType: 'employee', alsoEmployee: false, adminCategories: [] }); }}
                    variant="primary" size="sm">Add User</Btn>
                </div>
              </div>
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by username or name..."
                style={{ ...inputStyle, marginBottom: 0 }} />
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
              {filteredUsers.slice(0, 100).map(u => {
                const up = deriveUserPerms(u);
                return (
                  <Card key={u.username} style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: up.isFullAdmin ? `linear-gradient(135deg,${C.gold},#b8860b)` : up.isAdmin ? `linear-gradient(135deg,#7c3aed,#5b21b6)` : `linear-gradient(135deg,${C.navy},#1a3a6b)`,
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
                        background: up.isFullAdmin ? C.goldL : up.isAdmin ? '#f3e8ff' : C.blueL,
                        color: up.isFullAdmin ? '#7c2d12' : up.isAdmin ? '#5b21b6' : C.blue, letterSpacing: .3, textTransform: 'uppercase'
                      }}>
                        {roleSummaryLabel(up)}
                      </span>
                    </div>
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
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)}
        title={`${detailModal?.id} — Full Details`} width={640}>
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }} className="grid-2">
              {[
                ['Ticket ID', detailModal.id, C.navy, true],
                ['Status', STATUS_CFG[detailModal.status]?.label, STATUS_CFG[detailModal.status]?.color, false],
                ['Priority', (PRIORITY_CFG[detailModal.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).label, (PRIORITY_CFG[detailModal.priority] || PRIORITY_CFG[DEFAULT_PRIORITY]).color, false],
                ['Employee', detailModal.userName, C.text, false],
                ['Employee ID', detailModal.empId || '—', C.text, false],
                ['Department/Location', detailModal.dept, C.text, false],
                ['Category', detailModal.type, C.text, false],
                ['Submitted', fmtDT(detailModal.at), C.muted, false],
                ...(detailModal.status === 'resolved' || detailModal.status === 'closed' ? [
                  ['Resolved By', detailModal.actionBy || '—', C.green, false],
                  ['Resolved At', fmtDT(detailModal.actionAt) || '—', C.green, false],
                  ['Time Taken to Resolve', getDuration(detailModal.at, detailModal.actionAt), C.green, true],
                ] : [])
              ].map(([k, v, c, mono]) => (
                <div key={k} style={{ background: C.off, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: .6, marginBottom: 4, textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.off, borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: .6, marginBottom: 6, textTransform: 'uppercase' }}>Issue Description</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.7 }}>{detailModal.desc}</div>
            </div>
            {detailModal.solution && (
              <div style={{ background: C.greenL, borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: `1px solid #a7f3d0` }}>
                <div style={{ fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: .6, marginBottom: 6, textTransform: 'uppercase' }}>Solution</div>
                <div style={{ fontSize: 13, color: C.green, lineHeight: 1.6 }}>{detailModal.solution}</div>
              </div>
            )}
            {detailModal.holdReason && detailModal.status === 'hold' && (
              <div style={{ background: C.yellowL, borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: `1px solid #fde68a` }}>
                <div style={{ fontSize: 10, color: C.yellow, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Processing Note</div>
                <div style={{ fontSize: 13, color: C.yellow }}>{detailModal.holdReason}</div>
              </div>
            )}
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 14, letterSpacing: .6, textTransform: 'uppercase' }}>Timeline</div>
            <Timeline history={detailModal.history} />

            {(detailModal.status === 'resolved' || detailModal.status === 'closed') && (
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 10, letterSpacing: .6, textTransform: 'uppercase' }}>
                  Employee Satisfaction Rating
                </div>
                {detailModal.rating ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99,
                    fontSize: 13, fontWeight: 700,
                    border: `2px solid ${RATING_OPTIONS.find(r => r.key === detailModal.rating)?.color || C.border}`,
                    background: `${RATING_OPTIONS.find(r => r.key === detailModal.rating)?.color || C.muted}18`,
                    color: RATING_OPTIONS.find(r => r.key === detailModal.rating)?.color || C.text2
                  }}>
                    {RATING_OPTIONS.find(r => r.key === detailModal.rating)?.label || detailModal.rating}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>Not rated yet by the employee.</div>
                )}
                {detailModal.ratingRemark && (
                  <div style={{ background: C.off, borderRadius: 10, padding: '10px 14px', marginTop: 10, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: .6, marginBottom: 4, textTransform: 'uppercase' }}>Employee Remark</div>
                    <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{detailModal.ratingRemark}</div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                  This is set by the employee from their own portal — you can also print the slip below and collect it on paper.
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Single Print action lives inside getActionButtons for resolved/closed tickets — no duplicate button here. */}
              {getActionButtons(detailModal, true)}
              <Btn onClick={() => { setDeleteConfirm(detailModal); setDetailModal(null); }} variant="danger" size="sm">Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)}
        title={actionType === 'resolve' ? 'Resolve Ticket' : actionType === 'hold' ? 'Mark as Processing' : actionType === 'refuse' ? 'Refuse Ticket' : 'Close Ticket'}
        width={480}>
        {actionModal && (
          <div>
            <div style={{ background: C.off, borderRadius: 10, padding: '10px 14px', marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>TICKET</div>
              <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.navy }}>{actionModal.id}</div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{actionModal.userName} · {actionModal.dept}</div>
            </div>
            {actionType === 'resolve' && (
              <>
                <div style={{ background: C.blueL, borderRadius: 8, padding: '9px 13px', marginBottom: 16, fontSize: 12, color: C.blue }}>
                  Marking this as resolved will automatically close the ticket.
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel required>Resolved By (Technician Name)</FieldLabel>
                  <input value={actionForm.actionBy} onChange={e => af('actionBy', e.target.value)}
                    placeholder="Enter technician name" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel required>Solution / Action Taken</FieldLabel>
                  <textarea value={actionForm.solution} onChange={e => af('solution', e.target.value)}
                    rows={3} placeholder="Describe what was done to fix the issue..."
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="success" size="md" style={{ width: '100%' }}>Mark as Resolved &amp; Close</Btn>
              </>
            )}
            {actionType === 'hold' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel required>Reason for Processing</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e => af('reason', e.target.value)}
                    rows={3} placeholder="Why is this ticket being processed? (e.g., waiting for parts, vendor support needed...)"
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="warning" size="md" style={{ width: '100%' }}>Mark as Processing</Btn>
              </>
            )}
            {actionType === 'refuse' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel required>Reason for Refusal</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e => af('reason', e.target.value)}
                    rows={3} placeholder="Why is this ticket being refused?"
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="danger" size="md" style={{ width: '100%' }}>Refuse Ticket</Btn>
              </>
            )}
            {actionType === 'close' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <FieldLabel>Closing Note (Optional)</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e => af('reason', e.target.value)}
                    rows={3} placeholder="Any final note before closing..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Btn onClick={doAction} variant="ghost" size="md" style={{ width: '100%' }}>Close Ticket</Btn>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Ticket" width={400}>
        {deleteConfirm && (
          <div>
            <div style={{ background: C.redL, borderRadius: 12, padding: 18, marginBottom: 18, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: C.red, fontSize: 16, marginBottom: 6 }}>Confirm Deletion</div>
              <div style={{ color: C.red, fontSize: 13, lineHeight: 1.6 }}>
                Permanently delete <strong>{deleteConfirm.id}</strong>?<br />
                <span style={{ fontSize: 12, opacity: .8 }}>This cannot be undone.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={() => setDeleteConfirm(null)} variant="ghost" size="md" style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={() => handleDelete(deleteConfirm)} variant="danger" size="md" style={{ flex: 1 }}>Delete Permanently</Btn>
            </div>
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
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>This is what shows up everywhere in the portal — make sure it's their actual name, not a password or code.</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Password</FieldLabel>
            <input type="password" value={newUser.password} onChange={e => nu('password', e.target.value)}
              placeholder="Min 3 characters" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16, background: C.off, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <FieldLabel>User Type</FieldLabel>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text2, marginBottom: 10, cursor: 'pointer' }}>
              <input type="radio" style={{ marginTop: 3 }} checked={newUser.userType === 'employee'} onChange={() => nu('userType', 'employee')} />
              <span><strong>Employee</strong> — can only raise their own tickets. No admin portal access at all.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text2, marginBottom: 10, cursor: 'pointer' }}>
              <input type="radio" style={{ marginTop: 3 }} checked={newUser.userType === 'categoryAdmin'} onChange={() => nu('userType', 'categoryAdmin')} />
              <span><strong>Category Admin</strong> — manages (resolve/process/refuse) only the ticket categories you pick below, sees reports for only those categories. Cannot add/remove users or change anyone's access.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text2, marginBottom: 4, cursor: 'pointer' }}>
              <input type="radio" style={{ marginTop: 3 }} checked={newUser.userType === 'fullAdmin'} onChange={() => nu('userType', 'fullAdmin')} />
              <span><strong>Full Admin</strong> — sees and manages every category, every department, plus can add/remove users and grant access. Only give this to trusted people.</span>
            </label>

            {(newUser.userType === 'categoryAdmin' || newUser.userType === 'fullAdmin') && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.text2, margin: '12px 0 0', paddingTop: 12, borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
                <input type="checkbox" checked={newUser.alsoEmployee} onChange={e => nu('alsoEmployee', e.target.checked)} />
                Also give Employee access — this person can raise their own tickets too, and gets a "Switch view" button.
              </label>
            )}

            {newUser.userType === 'categoryAdmin' && (
              <div className="fadeIn" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text2, marginBottom: 8 }}>Which categories can they manage?</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button type="button" onClick={() => nu('adminCategories', [...COMPLAINT_TYPES])}
                    style={{ fontSize: 11, background: 'none', border: `1px solid ${C.border2}`, borderRadius: 6, padding: '3px 9px', cursor: 'pointer', color: C.navy }}>Select All</button>
                  <button type="button" onClick={() => nu('adminCategories', [])}
                    style={{ fontSize: 11, background: 'none', border: `1px solid ${C.border2}`, borderRadius: 6, padding: '3px 9px', cursor: 'pointer', color: C.muted }}>Clear</button>
                  <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>{newUser.adminCategories.length} selected</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6, maxHeight: 200, overflow: 'auto', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                  {COMPLAINT_TYPES.map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text2, cursor: 'pointer' }}>
                      <input type="checkbox" checked={newUser.adminCategories.includes(t)}
                        onChange={() => toggleCategoryIn(v => nu('adminCategories', v), newUser.adminCategories, t)} />
                      {TYPE_ICONS[t]} {t}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

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
            <div style={{ background: C.off, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: C.muted }}>Username (login ID, cannot be changed):</div>
              <div style={{ fontWeight: 700, color: C.text, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>{permModal.username}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Display Name</FieldLabel>
              <input value={permForm.displayName} onChange={e => pf('displayName', e.target.value)}
                placeholder="e.g. John Doe" style={inputStyle} />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>This is what shows up everywhere in the portal (top bar, ticket lists, reports) — fix it here if it was entered wrong (e.g. a password or number instead of the person's name).</div>
            </div>

            <div style={{ marginBottom: 16, background: C.off, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
              <FieldLabel>User Type</FieldLabel>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text2, marginBottom: 10, cursor: 'pointer' }}>
                <input type="radio" style={{ marginTop: 3 }} checked={permForm.userType === 'employee'} onChange={() => pf('userType', 'employee')} />
                <span><strong>Employee</strong> — can only raise their own tickets. No admin portal access at all.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text2, marginBottom: 10, cursor: 'pointer' }}>
                <input type="radio" style={{ marginTop: 3 }} checked={permForm.userType === 'categoryAdmin'} onChange={() => pf('userType', 'categoryAdmin')} />
                <span><strong>Category Admin</strong> — manages (resolve/process/refuse) only the ticket categories you pick below, sees reports for only those categories. Cannot add/remove users or change anyone's access.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.text2, marginBottom: 4, cursor: 'pointer' }}>
                <input type="radio" style={{ marginTop: 3 }} checked={permForm.userType === 'fullAdmin'} onChange={() => pf('userType', 'fullAdmin')} />
                <span><strong>Full Admin</strong> — sees and manages every category, every department, plus can add/remove users and grant access. Only give this to trusted people.</span>
              </label>

              {(permForm.userType === 'categoryAdmin' || permForm.userType === 'fullAdmin') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.text2, margin: '12px 0 0', paddingTop: 12, borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
                  <input type="checkbox" checked={permForm.alsoEmployee} onChange={e => pf('alsoEmployee', e.target.checked)} />
                  Also give Employee access — this person can raise their own tickets too, and gets a "Switch view" button.
                </label>
              )}

              {permForm.userType === 'categoryAdmin' && (
                <div className="fadeIn" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text2, marginBottom: 8 }}>Which categories can they manage?</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button type="button" onClick={() => pf('adminCategories', [...COMPLAINT_TYPES])}
                      style={{ fontSize: 11, background: 'none', border: `1px solid ${C.border2}`, borderRadius: 6, padding: '3px 9px', cursor: 'pointer', color: C.navy }}>Select All</button>
                    <button type="button" onClick={() => pf('adminCategories', [])}
                      style={{ fontSize: 11, background: 'none', border: `1px solid ${C.border2}`, borderRadius: 6, padding: '3px 9px', cursor: 'pointer', color: C.muted }}>Clear</button>
                    <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>{permForm.adminCategories.length} selected</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6, maxHeight: 200, overflow: 'auto', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                    {COMPLAINT_TYPES.map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text2, cursor: 'pointer' }}>
                        <input type="checkbox" checked={permForm.adminCategories.includes(t)}
                          onChange={() => toggleCategoryIn(v => pf('adminCategories', v), permForm.adminCategories, t)} />
                        {TYPE_ICONS[t]} {t}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
          <input type="password" value={newAdminPw.pw1} onChange={e => setNewAdminPw(s => ({ ...s, pw1: e.target.value }))}
            placeholder="Min 3 characters" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Confirm Password</FieldLabel>
          <input type="password" value={newAdminPw.pw2} onChange={e => setNewAdminPw(s => ({ ...s, pw2: e.target.value }))}
            placeholder="Re-enter password" style={inputStyle} />
        </div>
        <Btn onClick={changeAdminPw} variant="primary" size="md" style={{ width: '100%' }}>Change Password</Btn>
      </Modal>

      {/* Reset User Password Modal */}
      <Modal open={!!resetPwModal} onClose={() => setResetPwModal(null)} title="Reset User Password" width={400}>
        {resetPwModal && (
          <div>
            <div style={{ background: C.off, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: C.muted }}>Resetting password for:</div>
              <div style={{ fontWeight: 700, color: C.text, marginTop: 3 }}>{resetPwModal.displayName}</div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{resetPwModal.username}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <FieldLabel required>New Password</FieldLabel>
              <input type="password" value={newPwForUser} onChange={e => setNewPwForUser(e.target.value)}
                placeholder="Enter new password" style={inputStyle} />
            </div>
            <div style={{ background: C.yellowL, borderRadius: 8, padding: '9px 13px', marginBottom: 16, fontSize: 12, color: C.yellow }}>
              The user will be prompted to change their password on next login.
            </div>
            <Btn onClick={resetUserPw} variant="primary" size="md" style={{ width: '100%' }}>Reset Password</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
function AppInner() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('admin');

  const handleLogin = (u) => {
    setUser(u);
    const perms = deriveUserPerms(u);
    setViewMode(perms.isAdmin ? 'admin' : 'user');
  };
  const handleLogout = () => setUser(null);
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
        alert('You have been logged out because this account was signed in from another device or tab.');
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}