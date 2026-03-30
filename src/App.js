import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { db } from './firebase';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc
} from 'firebase/firestore';

// ╔══════════════════════════════════════════════════════════════╗
// ║   CHOITHRAM HOSPITAL & RESEARCH CENTRE                       ║
// ║   IT Hardware Helpdesk System — v2.0 (Firebase Edition)      ║
// ╚══════════════════════════════════════════════════════════════╝

// ── DEPARTMENTS ───────────────────────────────────────────────
const DEPARTMENTS = [
  "Wing B 311 (Discharge Summary)","Wing B 312","Wing B 314","Wing B 315","Wing B 316 (General Ward)",
  "Wing B 317","Wing B 318","General/Semi Nursing Counter","Nursing Counter","Burn Unit","Wing A Nursing Station",
  "HDU (307)","306","305","Genral Ward (304)","303","302","Procedure Room","301","Isolation Room (308)",
  "Doctor Duty Room","310","Colonoscopy (343)","Day Care (342)","341","340","Wing C Nursing Counter",
  "Doctor Duty Room (339)","HDU","CTG","Labour Room","Quality (254)","Organ Transplant Unit (RTU)",
  "Wing F Nursing Counter","Wing E Nursing Counter","Nursing Office","Store Room","Super Delux Counter",
  "Transplant Bone Marrow","ASW Nursing Counter","ASW Ward","OT Reception","OT Counsling Room",
  "OT Technician Room","OT Recovery","Operation Theatre (OT-1)","Operation Theatre (OT-2)",
  "Operation Theatre (OT-3)","Operation Theatre (OT-4)","Operation Theatre (OT-5)","Operation Theatre (OT-6)",
  "Operation Theatre (OT-7)","Operation Theatre (OT-8)","Operation Theatre (OT-9)","OT Store",
  "CCU Billing Counter","CCU Main Ward Counter","Cath Lab","Cath Lab Counselling Room","Doctor Lounge",
  "PICU","NICU","NICU Counter (Reception)","Seminar Room","ICU A Block","ICU B Block","ICU Counter",
  "Pathalogy","Microscopy 1","Microscopy 2","IHC Frozen Room","Histopathalogy","Section Cutting",
  "PCR Room","Master mix Room","TB Room","Ethics Committee","Clinical Research","Blood Bank",
  "Sample Collection","CSSD","IT Hardware","IT Training","IT Department","Digital Marketing",
  "Endoscopy Counselling Room","Endoscopy OT 1","Endoscopy OT 2","Endoscopy OT 3","Endoscopy Billing Counter",
  "West Wing Recovery Room","Dialysis Billing Counter","Dialysis Unit","Dialysis New Counter",
  "MRD","Billing","Revisit","Corporate Department","Xray","Xray Reporting Room","MRI Console",
  "Reporting Room (Old)","Admission Counter","Audit","Front Counter",
  "OPD 1","OPD 2","OPD 3","OPD 4","OPD 5","OPD 6","OPD 7","OPD 8","OPD 9","OPD 10",
  "OPD 11","OPD 12","OPD 12A","OPD 14","OPD 15","OPD 16","OPD 17","OPD 18","OPD 19","OPD 20",
  "OPD 21","OPD 22","OPD 23","OPD 24","OPD 25","OPD 26","OPD 27","OPD 28","OPD 29","OPD 30",
  "OPD 31","OPD 32","OPD 33","OPD 34","OPD 35","OPD 36","OPD 37","OPD 38","OPD 39","OPD 40",
  "OPD 41","OPD 42","Enquiry","Chairman's Office","HR Department","Canteen","Physiotherapy",
  "Nuclear Medicine","Sonography","Security Office","Project Office","House Keeping","Trust Office","Library"
];

const USERNAMES_RAW = `sagar.pathak,deepak.shelke,sunil.chandiwal,deepali.holkar,shubham.jain,sumit.nandedkar,anil.lakhwani,priyesh.vishwakarma,dheeraj.baluchi,aadesh.kumar,samir.das,nitin.sharma,sweta.akundi,vikramaditya.singh,dipanjali.nath,lakshi.maurya,ajit.ranjan,piyush.ghagre,rani.bisht,ranjana.yadav,dharmishta.rajput,indresh.chandele,shobha.chamania,vinay.prajapat,rajpal.singh,arpit.sethiya,ashish.goyal,vidyut.jain,mayank.cardio,hemlata.bareniya,narsi.reddy,vishal.panwar,sahil.parashar,pushpendra.joshi,sudhanshu.agnihotri,pawan.thada,shikha.mandloi,sumit.laley,avijit.mitra,vishal.patidar,bharti.malviya,chanda.purohit,arjun.maru,harsh.jakhetia,dinesh.mishra,shraddha.namjoshi,manoj.manjhi,avinash.sharma,alka.jain,ashish.patidar,aakansha.kaushal,samuel.pappachan,sachin.yadav,deepika.rathore,jitendra.joshi,manisha.rode,tinkesh.khandare,pooja.patidar,anurag.mourya,kanhaiya.mehra,girish.mandloi,bhawna.bhagwat,jitendra.tamraka,kunal.adhyaru,lokendra.patel,shubham.upadhyay,roshi.lanjewar,bs.thakur,nishant.shrivastava,sumit.singh,amber.mittal,priyank.shah,mayank.gastro,anjali.sharma,c.chamania,neela.oza,sarla.budhwani,navjot.saluja,ritika.jindal,prashant.srivastava,mayank.gusain,sandeep.rathore,divyansh.jain,arpit.jain,rohini.aktari,shubhangi.rawat,ruby.sengar,savita.agashe,rahul.bohat,ajay.patidar,harish.hamad,mukesh.meena,ganesh.yadav,dinesh.kumawat,madhuri.sahu,ambuj.jain,jitendra.dayaramani,anil.chauhan,gourav.pawar,rahul.kuwal,nitin.saxena,ravi.sahu,ankit.sharma,anand.meena,sapna.shukla,swapnil.jorvekar,supraja.vasu,farheen.ali,maya.varma,vinay.dubey,savan.agrwal,komal.pancholi,amit.deora,kedar.choudhary,pratik.khillari,mohan.yadav,priyanka.tiwari,mayuresh.hinduja,neha.rai,j.s.kathpal,ankitt.solanki,aniket.panwar,aayushi.mandloi,dhanraj.panjwani,mayur.sonare,neha.verma,bharat.sharma,dushyant.motiani,satish.motiani,deepika.jain,anamika.bhand,nilima.bhide,khushi.sen,sandeep.bhargava,deepak.pandit,shyamal.pal,sandeep.shivde,mayank.rathod,ravindra.kumar,rahul.raghuwanshi,shruti.raghuvanshi,raja.thambulkar,itsupport,rohit.jhawar,pratika.thada,nitin.gupta,sailee.jambhekar,deepak.panwar,hemlata.sharma,rajkumar.sangwan,deepak.khetan,prakash.doodhiya,sayli.khandelwal,deepak.patel,harsh.patel,manjeet.shinde,pushkar.dravid,shishank.bhadouriya,vivek.ashokan,kartik.batham,kartik.joshi,chetan.asawara,rashmi.baghel,muskan.kushwah,rahul.vaskale,sonu.surawat,rajkumar.basantani,abha.soni,pooja.dole,ranjeet.kaur,divyanshi.chouhan,akash.dass,purnima.bhale,vibhooti.trivedi,dilesh.sangeliya,sarfraz.khan,sminesh.philip,shivani.panwar,abhik.sikdar,nitika.yadav,richa.agrawal,sameer.nivsarkar,shrikant.phatak,siddharthsingh.chauhan,abhishek.raghuvanshi,saraswati.pandey,chetan.parmar,shivani.jaiswal,anand.sanghi,ratan.sahajpal,supriya.choudhary,shailendra.patel,suresh.carleton,chhabra.sokhey,piyush.joshi,vikram.balwani,alok.kumar,jai.kriplani,neha.agrawal,minakshi.sharma,sushma.jhamad,rajesh.patidar,vikas.asati,ali.saify,ameya.rangnekar,arjun.wadhwani,manoj.dubey,anshul.jaiswal,jenisha.jain,prashant.agrawal,rashmi.shad,shivani.patel,pravesh.kanthed,mahendra.acharya,gaurav.gupta,pradeep.jain,rajendra.aanjne,suruchi.singh,kumashantanu.navlekar,praveen.agrawal,sunanda.samanta,drnaman,parul.baldi,saurabh.duggad,siddharth.saraf,aneeta.patel,sarita.bamniya,princy.nathen,kavita.jatav,chandani.makwana,sarja.khaped,pooja.nargis,megha.sharma,anita.solanki,asha.bandole,kavita.shah,sheetal.kharat,seema.rawat,sonal.chaudhary,santoshi.panika,vina.ovhal,anjali.pal,subhashini.patel,ankita.verma,aruna.bhabar,priyanka.prajapati,divyani.choure,sangeeta.rawat,harsha.nirmal,pooja.dawar,jyoti.shivhare,sitara.bano,priyanka.lohar,roshni.solanki,shraddna.panwar,nandani.chouhan,hemlata.choudhary,jyoti.khatarkar,kirti.yadav,teena.namdev,arti.mandloi,sapna.todarmal,paramjeet.verma,diksha.wadbude,renu.tatware,sayma.chouhan,satendra.singh,rahul.goyal,durgesh.chawda,durga.eske,sharmila.maurya,hinisha.rathod,shubham.tare,ankita.soliwal,jyotshna.songara,pooja.yadav,harsha.duchakke,abhay.patel,aniket.pradhan,anand.malviya,ayush.francis,babulal.godiya,balram.meena,seema.yadav,rahul.parmar,sachin.sharma,sheetal.patel,sonu.prajapat,subhash.shinde,suyash.sisodiya,isha.soni,kaveeta.sharma,kirti.ahire,laxmi.kushwah,mayuri.nagar,minakshi.mehta,monika.verma,aman.piplodiya,anmol.pathak,mayank.naik,pinky.verma,harpreet.kaur,pal.singh,neha.neema,prachi.rathore,pratibha.dewatwal,priyanka.gonker,ravi.bavniya,ruchika.gangrade,sonam.sonare,suraj.dwivedi,vinita.ingle,khushi.meena,sulochana.chandrawat,manisha.jat,yogita.jajme,priyanka.chaporkar,deepali.puranik,amrata.pal,shobha.sharma,barkha.bamaniya,praveena.umbarkar,sangeeta.pardeshi,prateek.jadhav,kumkum.jain,pooja.bahediya,ishika.kathoriya,smita.pandit,reena.bonde,jayshree.supekar,deepati.vishwkarma,pinku.soni,sanjay.patil,aayushi.shambhawani,shyam.malviya,sawan.dharwe,nitika.singh,roshni.kurmi,chhaya.kushwah,anand.wasle,revisit.counter,vipin.kashyap,pawan.meena,vijay.shikarwar,varsha.sharma,anita.sendhalkar,verma.monika,akash.yevale,hemant.meena,mercy.paulose,mohit.sharma,nanda.hemwani,nandini.ahire,navin.patidar,nikita.chouhan,nikita.kharche,padma.tiwari,pramod.raghuwanshi,subhash.sharma,leena.sahu,sagheer.ahmed,prakash.yadav,sangeeta.chouhan,manish.tripathi,matin.ahmed,rahul.muwel,pramod.tiwari,roopali.mourya,bharti.yadav,prachi.sahu,kushboo.kashyap,pramod.mithoriya,shubham.malviya,abhay.dhaigude,vinita.phapunkar,pradeep.dhansore,alka.malviya,divya.panchal,bane.singh,mohan.jat,kanchan.sharma,anita.sharma,vikash.chourasiya,sonu.jat,priya.chouhan,pallavi.chutel,devendra.dubey,divya.bhati,sushmita.sen,aditi.yadav,kavita.toplani,priyanka.joshi,ajay.parmar,twinkle.darwai,sheetal.jain,jaya.badke,akash.ramawat,priyanka.bhagat,pushpalata.gehlot,rahul.jain,raisa.khan,rajendra.lad,raju.pardeshi,rakesh.tomar,robin.bandod,sabiha.ahmed,samarth.solanki,sangeeta.kaushal,satish.phatak,shubham.yadav,shewta.chandorkar,sonali.tapkire,thankmony.nair,vikash.verma,vishaka.rajput,yashita.tanwar,amit.dhurve,rajeshwai.pandhran,sachin.sen,sonakshi.sabnani,sunil.karma,varsha.yadav,mukesh.sharma,snehal.vairagkar,abhinav.gupta,kanish.markam,rupali.pawar,vimal.kumar,mukesh.sonti,kuldeep.saini,rajesh.gurjar,rajesh.mourya,sp.jaiswal,pushkar.joshi,megha.gour,kritika.jain,bidhi.kushwaha,mahima.ochani,sonali.poorkar,rinta.vincent,chhaya.gevare,ramendra.thakur,antim.tegar,taniya.panwar,sanjeev.choudhary,nilesh.tailor,deepak.choudhary,seema.jamod,mamta.sharma,asma.mansuri,ravina.solanki,vandan.solanki,vandana.nilkanth,radha.dawar,maya.verma,raj.kumar,sachin.wagh,sheetal.birthare,anita.vigrodiya,kajal.rajput,rajesh.ingle,hansraj.chouhan,lk.mourya,deepak.shrivastav,shubham.sisodiya,aniket.oad,kedar.rathore,vinod.rathore,bhuwan.gite,rahul.khandekar,shivlal.kushwah,bharti.sain,palak.sharma,laxmi.khilwani,neelam.vishwakarma,anil.shimle,atharva.joglekar,garv.khaturiya,anushka.tiwari,pooja.muzalde,vijay.thakur,daya.galav,satish.uikey,bhoopendra.sharma,ajay.verma,saroj.vishawakarma,rinku.kirade,neetu.amre,priyanka.rawat,pooja.solanki,khushboo.patel,kiran.jamra,kavita.eskey,priya.sahu,papuni.nayak,monika.choudhary,yashooda.shah,lalita.kirade,rekha.verma,pooja.patel,vandana.vish,riya.savner,nimisha.joseph,akriti.patel,somini.thomas,harshita.swami,payal.sahani,chitra.lande,anita.jadhav,chetna.yadav,chavan.rajesh,verma.neha,kanungo.sheel,jitendra.singh,kumkum.katarya,kirti.patel,monika.randa,sonali.vishwakarma,radheshyam.barsker,anil.panwar,ajay.tagore,panwar.anil,rincy.chacko,aagnes.francis,kavita.dangi,neha.chourase,akansha.ninama,anita.chouhan,chhaya.chouhan,aleen.vira,aakanksha.dhurve,rajendra.vishwkarma,priyanka.parashar,shubham.gehlot,priya.patil,rani.nagar,monika.jain,priyanka.jat,miti.jain,kanika.panchal,upma.rathore,sophia.stephon,riya.das,neha.yadav,vijaylaxmi.nair,blessy.john,kabita.laishram,aushi.raikwar,kirti.tiwari,rachana.ruhela,sakshi.sohani,nisha.patidar,karuna.singad,bharti.gandhare,kiran.rathore,divya.sahu,kavita.patil,satish.dohre,karishma.yadav,reena.bhuriya,shalom.maseeh,rameela.mujalde,nuri.barde,chanda.solanki,pooja.gujre,vandna.dawar,chhaya.gurjar,anju.chandran,roshan.mourya,vipin.patel,sanjay.soni,sunil.singh,jaya.barfa,pankaj.chouhan,vaishali.rathore,priya.yadav,pradeep.mansore,mvr,pravin.soni,ritu.sikligar,naresh.bharti,sarthak.shrivastava,manshi.bijore,ravi.nagar,pradeep.gupta,asw1,dranilkumar,burnunit,cathlab,xray,deluxeward,dialysis,drpraveen,endoscopy,entopd,cicu,femaleward,maleward,neuro,nsw1,gynward,otchrc,paedicu,painopd,pvtward,rad11,rad1.dept,itdept,respilab,drsunanda,micu,rad9,dryogesh,ortho,drshailesh,jitendra.patidar,vini.jhariya,namrata.awasarkar,deepak.sadh,samyak.pancholi,atul.tiwari,lalu.yadav,aleena.soby,muskan.uprale,jitendra.prajapat,maharban.kanesh,dilip.chourasia,gopal.hirlakar,rajesh.yadav,deepak.jaiswal,manoj.hardiya,deepak.mourya,manju.chouhan,kalsing.barde,yogesh.parmar,joy.jisha,kunta.barela,jasma.solanki,ashish.victor,jasslin.verghese,alvi.thomas,jissa.abraham,surbhi.makode,shivani.chouhan,nandini.sharma,rekha.rathore,sunil.malviya,arti.kochale,neha.upadhyay,sofiya.parveen,varsha.kharari,niharika.baraskar,mahima.rathore,aarti.khede,jaya.bariya,preeti.sawner,seemita.yadav,anuradha.dodiya,manjuri.chatterjee,priyanka.prajapat,sonal.yadav,nitu.gupta,reesa.mariam,sherin.anna,minal.bondane,surendra.nayak,shefali.narware,lata.panwar,shivani.mourya,josna.joseph,sheetal.solanki,sherin.shaji,retam.ajnar,ravina.malviya,chouhan.abhishek,neelam.sharma,anjali.jamnik,diksha.jharbade,ishika.devid,dipika.patel,vandana.vishwakarma,poonam.more,kavita.bhawar,shivani.bachhave,seema.dodve,pinky.bamniya,ranu.varma,nisha.patel,raksha.rathore,gokul.rathode,purnima.gupta,sheeta.pateliya,paritosh.rajput,anjali.vishwakarma,surbhi.narware,lalita.solanki,varsha.rathore,nisha.mariyam,aksha.rajan,swati.mujalde,ritu.chouhan,saloni.bhargav,arjun.akhadiya,rajni.chouhan,sonalika.dawar,pooja.morya,hiramani.gehlot,diksha.malviya,sajna.bamniya,ajay.panchal,mithun.chouhan,vikas.patidar,shivani.namdev,rohit.gandhwane,ravindra.solanki,shireen.sheikh,abhishek.agrawal,rekha.choudhary,sandhya.vishwakarmaa,ananya.sharma,ramesh.dawar,lalit.tanwar,anubhav.pandey,huzefa.kachchawala,avani.mahajan,sanyukta.vishnar,dhruvika.joshi,purva.rathore,abhishek.meena,ved.prakash,siddharth.chauhan,gouri.passi,harish.laad,hema.sharma,ankit.yadav,namrata.choudhary,saibaba.suvarna,support.suvarna,yash.tripathi,yashvini.verma`;

const ADMIN_USERS = ['admin', 'itdept', 'it.hardware',];

const INITIAL_USERS = [
  { username: 'admin', password: 'Admin@CHRC2024', firstLogin: false, role: 'admin', displayName: 'IT Admin' },
  ...USERNAMES_RAW.split(',').map(u => {
    const clean = u.trim().toLowerCase();
    return {
      username: clean,
      password: 'Chrc@1234',
      firstLogin: true,
      role: ADMIN_USERS.includes(clean) ? 'admin' : 'user',
      displayName: clean.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    };
  })
];

const COMPLAINT_TYPES = ['Hardware', 'Network', 'Software', 'Printer', 'PC Shifting'];
const PRINTER_SUBTYPES = ['Black & White Printer', 'Color Printer', 'Ink Refill', 'Barcode Printer', 'Scanner', 'Barcode Reader'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_CFG = {
  pending:  { label: 'Pending',   color: '#b45309', bg: '#fef3c7', dot: '#f59e0b',  icon: '⏳' },
  resolved: { label: 'Resolved',  color: '#065f46', bg: '#d1fae5', dot: '#10b981',  icon: '✅' },
  refused:  { label: 'Refused',   color: '#991b1b', bg: '#fee2e2', dot: '#ef4444',  icon: '❌' },
  closed:   { label: 'Closed',    color: '#374151', bg: '#f3f4f6', dot: '#9ca3af',  icon: '🔒' },
  submitted:{ label: 'Submitted', color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6',  icon: '📤' },
};

// ── FIREBASE DB LAYER ─────────────────────────────────────────
const FireDB = {
  // Users
  async getUsers() {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (snap.empty) return null;
      return snap.docs.map(d => ({ ...d.data(), _id: d.id }));
    } catch { return null; }
  },
  async initUsers(users) {
    try {
      for (const u of users) {
        await setDoc(doc(db, 'users', u.username), u);
      }
    } catch(e) { console.error('initUsers error', e); }
  },
  async updateUser(username, data) {
    try { await updateDoc(doc(db, 'users', username), data); } catch(e) { console.error(e); }
  },

  // Complaints
  async addComplaint(complaint) {
    try {
      const ref = await addDoc(collection(db, 'complaints'), {
        ...complaint,
        createdAt: serverTimestamp()
      });
      return ref.id;
    } catch(e) { console.error(e); return null; }
  },
  async updateComplaint(id, data) {
    try { await updateDoc(doc(db, 'complaints', id), data); } catch(e) { console.error(e); }
  },
  async deleteComplaint(id) {
    try { await deleteDoc(doc(db, 'complaints', id)); } catch(e) { console.error(e); }
  },
  subscribeComplaints(callback) {
    const q = query(collection(db, 'complaints'), orderBy('at', 'desc'));
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
      callback(data);
    }, err => { console.error('subscribeComplaints:', err); callback([]); });
  },

  // Ticket sequence
  async getNextSeq() {
    try {
      const ref = doc(db, 'meta', 'ticket_seq');
      const snap = await getDoc(ref);
      const current = snap.exists() ? (snap.data().value || 1) : 1;
      await setDoc(ref, { value: current + 1 });
      return current;
    } catch { return Date.now(); }
  },

  // Broadcast messages
  async getBroadcast() {
    try {
      const snap = await getDoc(doc(db, 'meta', 'broadcast'));
      return snap.exists() ? snap.data() : null;
    } catch { return null; }
  },
  async setBroadcast(msg, by) {
    try {
      await setDoc(doc(db, 'meta', 'broadcast'), {
        message: msg, by, active: true, at: new Date().toISOString()
      });
    } catch(e) { console.error(e); }
  },
  async clearBroadcast() {
    try { await setDoc(doc(db, 'meta', 'broadcast'), { active: false, message: '', by: '', at: '' }); } catch(e) { console.error(e); }
  },
  subscribeBroadcast(callback) {
    return onSnapshot(doc(db, 'meta', 'broadcast'), snap => {
      callback(snap.exists() ? snap.data() : null);
    });
  }
};

// ── HELPERS ───────────────────────────────────────────────────
const genTicket = (n) => `IT-CHRC-${String(n).padStart(4,'0')}`;
const now = () => new Date().toISOString();
const fmtDT = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}); }
  catch { return d; }
};

// ── LUXURY THEME ──────────────────────────────────────────────
const C = {
  navy:    '#0a1628',
  navy2:   '#0d1f3c',
  navy3:   '#122244',
  gold:    '#c9a84c',
  gold2:   '#e8c96c',
  goldL:   '#fdf6e3',
  white:   '#ffffff',
  off:     '#f7f8fc',
  card:    '#ffffff',
  border:  '#e4e9f2',
  border2: '#c8d0e0',
  text:    '#0d1f3c',
  text2:   '#2d3d5c',
  muted:   '#6b7a99',
  green:   '#065f46',
  greenL:  '#d1fae5',
  yellow:  '#b45309',
  yellowL: '#fef3c7',
  red:     '#991b1b',
  redL:    '#fee2e2',
  blue:    '#1e40af',
  blueL:   '#dbeafe',
  accent:  '#1a56db',
};

// ── GLOBAL STYLES ─────────────────────────────────────────────
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.off};font-family:'DM Sans',sans-serif;color:${C.text};font-size:14px;}
input,select,textarea,button{font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:#f1f5f9;}
::-webkit-scrollbar-thumb{background:#c8d0e0;border-radius:99px;}
::-webkit-scrollbar-thumb:hover{background:#a0aec0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes glow{0%,100%{box-shadow:0 0 8px #c9a84c40}50%{box-shadow:0 0 18px #c9a84c80}}
.fadeUp{animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both;}
.fadeIn{animation:fadeIn .3s ease both;}
.slideDown{animation:slideDown .22s ease both;}
.pulse{animation:pulse 2.5s infinite;}
.live-dot::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:6px;animation:pulse 2s infinite;}

/* Gold shimmer for luxury feel */
.gold-text{background:linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}

@media(max-width:640px){
  .hide-sm{display:none!important;}
  .grid-2{grid-template-columns:1fr!important;}
  .grid-3{grid-template-columns:1fr 1fr!important;}
}
`;

// ── UI ATOMS ──────────────────────────────────────────────────
function Btn({ children, onClick, variant='primary', size='md', style={}, disabled=false, type='button' }) {
  const vs = {
    primary:{ background:`linear-gradient(135deg,#0a1628,#1a3a6b)`,color:'#fff',border:'1px solid #1a3a6b',boxShadow:'0 2px 8px #0a162830' },
    gold:   { background:`linear-gradient(135deg,#b8860b,#c9a84c,#e8c96c)`,color:'#0a1628',border:'1px solid #c9a84c',boxShadow:'0 2px 8px #c9a84c40',fontWeight:700 },
    success:{ background:`linear-gradient(135deg,#064e3b,#065f46)`,color:'#fff',border:'none',boxShadow:'0 1px 4px #06594640' },
    danger: { background:`linear-gradient(135deg,#7f1d1d,#991b1b)`,color:'#fff',border:'none',boxShadow:'0 1px 4px #99121240' },
    warning:{ background:`linear-gradient(135deg,#92400e,#b45309)`,color:'#fff',border:'none',boxShadow:'0 1px 4px #b4530940' },
    ghost:  { background:'transparent',color:C.muted,border:`1px solid ${C.border2}` },
    outline:{ background:'transparent',color:C.accent,border:`1.5px solid ${C.accent}` },
  };
  const ss = {
    sm:{ padding:'5px 13px',fontSize:12,borderRadius:8 },
    md:{ padding:'9px 20px',fontSize:13,borderRadius:9 },
    lg:{ padding:'13px 28px',fontSize:15,borderRadius:11 }
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...vs[variant],...ss[size],fontWeight:600,cursor:disabled?'not-allowed':'pointer',
        opacity:disabled?.55:1,transition:'all .18s',letterSpacing:.2,...style }}>
      {children}
    </button>
  );
}

function Card({ children, style={}, className='' }) {
  return (
    <div className={className} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
      boxShadow:'0 2px 12px #0a162810',...style }}>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const m = STATUS_CFG[status] || { label:status, color:C.muted, bg:'#f1f5f9', dot:C.muted, icon:'•' };
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'4px 11px',borderRadius:99,
      fontSize:11,fontWeight:700,color:m.color,background:m.bg,letterSpacing:.3 }}>
      <span style={{ width:6,height:6,borderRadius:'50%',background:m.dot,flexShrink:0 }}/>
      {m.label.toUpperCase()}
    </span>
  );
}

function StatCard({ icon, label, value, color, bg, sub }) {
  return (
    <div className="fadeUp" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
      padding:'20px 22px',flex:1,minWidth:150,boxShadow:'0 2px 12px #0a162808',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,right:0,width:80,height:80,borderRadius:'0 16px 0 80px',
        background:bg,opacity:.4 }}/>
      <div style={{ width:44,height:44,borderRadius:12,background:bg,
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:14,
        border:`1px solid ${color}22` }}>
        {icon}
      </div>
      <div style={{ fontSize:32,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace",lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12,color:C.muted,marginTop:6,fontWeight:500,letterSpacing:.3 }}>{label}</div>
      {sub && <div style={{ fontSize:11,color,marginTop:3,fontWeight:600 }}>{sub}</div>}
    </div>
  );
}

function Modal({ open, onClose, title, children, width=520 }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed',inset:0,background:'#0a162880',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(4px)' }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fadeUp" style={{ background:C.card,borderRadius:20,width:'100%',maxWidth:width,
        maxHeight:'90vh',overflow:'auto',boxShadow:'0 30px 80px #0a162840' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',
          padding:'18px 24px',borderBottom:`1px solid ${C.border}`,
          background:`linear-gradient(135deg,${C.navy},${C.navy3})`,borderRadius:'20px 20px 0 0' }}>
          <span style={{ fontWeight:700,fontSize:16,color:'#fff',fontFamily:"'Cormorant Garamond',serif",letterSpacing:.5 }}>{title}</span>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'none',
            color:'#fff',fontSize:20,cursor:'pointer',lineHeight:1,width:30,height:30,
            borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label style={{ display:'block',fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,
      letterSpacing:.6,textTransform:'uppercase' }}>
      {children}{required&&<span style={{ color:C.red }}> *</span>}
    </label>
  );
}

const inputStyle = {
  width:'100%',background:'#f7f8fc',border:`1.5px solid ${C.border}`,
  borderRadius:10,padding:'10px 14px',color:C.text,fontSize:13,outline:'none',
  transition:'border .15s',lineHeight:1.4
};

// ── SEARCHABLE DROPDOWN ───────────────────────────────────────
function SearchDropdown({ label, value, onChange, options, placeholder='Search...', required=false }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = useMemo(() =>
    q ? options.filter(o=>o.toLowerCase().includes(q.toLowerCase())) : options,
    [q, options]
  );
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div style={{ marginBottom:18 }} ref={ref}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ position:'relative' }}>
        <input
          value={open ? q : value}
          onChange={e=>{ setQ(e.target.value); setOpen(true); }}
          onFocus={()=>{ setOpen(true); setQ(''); }}
          placeholder={value||placeholder}
          style={{ ...inputStyle,paddingRight:38 }}
        />
        <span style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
          color:C.muted,fontSize:11,pointerEvents:'none' }}>{open?'▲':'▼'}</span>
      </div>
      {open && filtered.length > 0 && (
        <div className="slideDown" style={{ position:'absolute',zIndex:300,background:C.card,
          border:`1.5px solid ${C.border2}`,borderRadius:12,marginTop:3,
          maxHeight:220,overflow:'auto',boxShadow:'0 12px 32px #0a162820',
          width:'100%',left:0 }}>
          {filtered.map(o=>(
            <div key={o}
              onMouseDown={()=>{ onChange(o); setOpen(false); setQ(''); }}
              style={{ padding:'9px 14px',cursor:'pointer',fontSize:13,color:C.text,
                background:value===o?C.blueL:'transparent',
                fontWeight:value===o?600:400,transition:'background .1s',borderRadius:4 }}
              onMouseEnter={e=>{ if(value!==o) e.currentTarget.style.background='#f0f4ff'; }}
              onMouseLeave={e=>{ if(value!==o) e.currentTarget.style.background='transparent'; }}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STATUS TIMELINE ───────────────────────────────────────────
function Timeline({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div style={{ position:'relative' }}>
      {history.map((h, i) => (
        <div key={i} style={{ display:'flex',gap:14,marginBottom:18 }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0,width:22 }}>
            <div style={{ width:14,height:14,borderRadius:'50%',
              background:STATUS_CFG[h.status]?.dot||C.muted,marginTop:3,
              boxShadow:`0 0 0 4px ${STATUS_CFG[h.status]?.bg||'#f1f5f9'}`,flexShrink:0 }}/>
            {i<history.length-1 && <div style={{ width:2,flex:1,background:`linear-gradient(${STATUS_CFG[h.status]?.dot||C.muted},${C.border})`,margin:'5px 0',minHeight:20 }}/>}
          </div>
          <div style={{ flex:1,paddingBottom:4 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6,flexWrap:'wrap',gap:6 }}>
              <Badge status={h.status}/>
              <span style={{ fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono',monospace" }}>{fmtDT(h.at)}</span>
            </div>
            <div style={{ background:STATUS_CFG[h.status]?.bg||C.off,borderRadius:10,padding:'10px 13px',
              border:`1px solid ${STATUS_CFG[h.status]?.dot||C.border}22` }}>
              <div style={{ fontSize:13,color:C.text2,lineHeight:1.6 }}>{h.note}</div>
              {h.by && <div style={{ fontSize:11,color:C.muted,marginTop:5,fontWeight:600 }}>
                👤 {h.by}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── BROADCAST BANNER ──────────────────────────────────────────
function BroadcastBanner({ message, onDismiss }) {
  if (!message || !message.active || !message.message) return null;
  return (
    <div style={{ background:`linear-gradient(135deg,#7c3aed,#5b21b6)`,
      padding:'12px 20px',display:'flex',alignItems:'center',gap:14,
      boxShadow:'0 4px 16px #7c3aed40',animation:'fadeIn .5s ease' }}>
      <span style={{ fontSize:20,flexShrink:0 }}>📢</span>
      <div style={{ flex:1 }}>
        <div style={{ color:'#fff',fontWeight:700,fontSize:12,letterSpacing:.5,opacity:.8,marginBottom:2 }}>
          IT DEPARTMENT NOTICE
        </div>
        <div style={{ color:'#fff',fontSize:14,lineHeight:1.5,fontWeight:500 }}>{message.message}</div>
        {message.at && <div style={{ color:'rgba(255,255,255,0.6)',fontSize:11,marginTop:3 }}>
          Posted by {message.by} • {fmtDT(message.at)}</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ══════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);

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

  const handle = async () => {
    if (!username.trim() || !password.trim()) { setError('Please enter username and password'); return; }
    if (!initDone) { setError('System initializing, please wait...'); return; }
    setError(''); setLoading(true);
    await new Promise(r=>setTimeout(r,400));
    const users = await FireDB.getUsers();
    if (!users) { setError('Cannot connect to database. Check Firebase setup.'); setLoading(false); return; }
    const u = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!u) { setError('Username not found'); setLoading(false); return; }
    if (u.password !== password) { setError('Incorrect password'); setLoading(false); return; }
    onLogin(u);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh',background:`linear-gradient(150deg,${C.navy} 0%,#0d2550 40%,#1a4080 70%,#0a2240 100%)`,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden' }}>
      <style>{GS}</style>
      {/* Background decoration */}
      <div style={{ position:'fixed',top:-150,right:-150,width:500,height:500,borderRadius:'50%',
        background:'radial-gradient(circle,#c9a84c15,transparent 70%)',pointerEvents:'none' }}/>
      <div style={{ position:'fixed',bottom:-100,left:-100,width:400,height:400,borderRadius:'50%',
        background:'radial-gradient(circle,#1a56db20,transparent 70%)',pointerEvents:'none' }}/>
      <div style={{ position:'fixed',top:'30%',left:'5%',width:1,height:200,
        background:'linear-gradient(transparent,#c9a84c40,transparent)',pointerEvents:'none' }}/>
      <div style={{ position:'fixed',top:'30%',right:'5%',width:1,height:200,
        background:'linear-gradient(transparent,#c9a84c40,transparent)',pointerEvents:'none' }}/>

      <div className="fadeUp" style={{ width:'100%',maxWidth:440 }}>
        {/* Hospital Branding */}
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',
            width:80,height:80,borderRadius:24,
            background:'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.05))',
            backdropFilter:'blur(10px)',marginBottom:18,fontSize:38,
            border:'1px solid rgba(201,168,76,0.3)',boxShadow:'0 0 30px rgba(201,168,76,0.15)' }}>
            🏥
          </div>
          <h1 style={{ color:'#fff',fontSize:24,fontWeight:700,lineHeight:1.3,marginBottom:6,
            fontFamily:"'Cormorant Garamond',serif",letterSpacing:.5 }}>
            Choithram Hospital &<br/>Research Centre
          </h1>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,
            background:'rgba(201,168,76,0.15)',backdropFilter:'blur(10px)',borderRadius:99,
            padding:'6px 18px',border:'1px solid rgba(201,168,76,0.3)',marginTop:8 }}>
            <span style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',
              animation:'pulse 2s infinite',display:'inline-block' }}/>
            <span style={{ color:'rgba(255,255,255,0.9)',fontSize:12,fontWeight:600,letterSpacing:.8 }}>
              IT HARDWARE HELPDESK
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div style={{ background:'rgba(255,255,255,0.97)',borderRadius:24,padding:32,
          boxShadow:'0 30px 80px rgba(0,0,0,0.4),0 0 0 1px rgba(201,168,76,0.2)' }}>
          <div style={{ marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${C.border}` }}>
            <h2 style={{ fontWeight:700,fontSize:20,color:C.text,fontFamily:"'Cormorant Garamond',serif" }}>
              Welcome Back
            </h2>
            <p style={{ color:C.muted,fontSize:13,marginTop:4 }}>Sign in to access your helpdesk portal</p>
          </div>

          <div style={{ marginBottom:18 }}>
            <FieldLabel>Username</FieldLabel>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handle()}
              placeholder="Enter your username"
              style={{ ...inputStyle }} />
          </div>

          <div style={{ marginBottom:10 }}>
            <FieldLabel>Password</FieldLabel>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} value={password}
                onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handle()}
                placeholder="Enter your password"
                style={{ ...inputStyle,paddingRight:46 }} />
              <button onClick={()=>setShowPw(s=>!s)}
                style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',color:C.muted,fontSize:17,lineHeight:1 }}>
                {showPw?'🙈':'👁️'}
              </button>
            </div>
          </div>

          {!initDone && (
            <div style={{ background:'#f0f9ff',border:`1px solid #bae6fd`,borderRadius:9,
              padding:'9px 13px',color:'#0369a1',fontSize:12,marginBottom:12,display:'flex',gap:8,alignItems:'center' }}>
              <span className="pulse">⚙️</span> Connecting to database...
            </div>
          )}

          {error && (
            <div style={{ background:C.redL,border:`1px solid #fca5a5`,borderRadius:9,
              padding:'10px 14px',color:C.red,fontSize:12,marginBottom:12,fontWeight:500 }}>
              ⚠️ {error}
            </div>
          )}

          <Btn onClick={handle} disabled={loading||!initDone} style={{ width:'100%',marginTop:16,padding:'14px' }} size="lg" variant="primary">
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </Btn>

          <div style={{ marginTop:20,padding:'14px 16px',background:`linear-gradient(135deg,${C.goldL},#fff9e6)`,
            borderRadius:10,border:`1px solid #e8d5a3` }}>
            <p style={{ textAlign:'center',fontSize:12,color:'#92400e',fontWeight:500 }}>
              🔑 Default password: <span style={{ fontFamily:"'JetBrains Mono',monospace",
                fontWeight:700,color:'#7c2d12' }}>Chrc@1234</span>
              <br/><span style={{ color:C.muted,fontSize:11 }}>You'll be asked to change it on first login</span>
            </p>
          </div>
        </div>

        <p style={{ textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:20,letterSpacing:.3 }}>
          © Choithram Hospital IT Department · Developed by Harish Hamad
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  FIRST LOGIN — PASSWORD CHANGE
// ══════════════════════════════════════════════════════════════
function ChangePasswordPage({ user, onDone, onLogout }) {
  const [form, setForm] = useState({ new1:'', new2:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const f = (k,v) => setForm(s=>({...s,[k]:v}));

  const handle = async () => {
    if (form.new1.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.new1 !== form.new2) { setError('Passwords do not match'); return; }
    if (form.new1 === 'Chrc@1234') { setError('Please choose a different password'); return; }
    setError(''); setLoading(true);
    await FireDB.updateUser(user.username, { password: form.new1, firstLogin: false });
    onDone({...user, password:form.new1, firstLogin:false});
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh',background:`linear-gradient(150deg,${C.navy},#0d2550,#1a4080)`,
      display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <style>{GS}</style>
      <div className="fadeUp" style={{ width:'100%',maxWidth:420 }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🔐</div>
          <h2 style={{ color:'#fff',fontSize:22,fontWeight:700,fontFamily:"'Cormorant Garamond',serif" }}>
            Set Your Password
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)',fontSize:13,marginTop:8,lineHeight:1.6 }}>
            Welcome, <strong style={{ color:'#fff' }}>{user.displayName}</strong>!<br/>
            Create a secure password to continue.
          </p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.97)',borderRadius:24,padding:30,
          boxShadow:'0 30px 80px rgba(0,0,0,0.4)' }}>
          <div style={{ marginBottom:18 }}>
            <FieldLabel>New Password</FieldLabel>
            <input type="password" value={form.new1} onChange={e=>f('new1',e.target.value)}
              placeholder="Minimum 6 characters" style={inputStyle} />
          </div>
          <div style={{ marginBottom:18 }}>
            <FieldLabel>Confirm Password</FieldLabel>
            <input type="password" value={form.new2} onChange={e=>f('new2',e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handle()}
              placeholder="Re-enter your password" style={inputStyle} />
          </div>
          {error && <div style={{ background:C.redL,border:`1px solid #fca5a5`,borderRadius:9,
            padding:'10px 14px',color:C.red,fontSize:12,marginBottom:14 }}>⚠️ {error}</div>}
          <Btn onClick={handle} disabled={loading} style={{ width:'100%',padding:'13px' }} size="lg" variant="primary">
            {loading?'Saving...':'Set Password & Continue →'}
          </Btn>
          <button onClick={onLogout} style={{ width:'100%',marginTop:12,background:'none',border:'none',
            color:C.muted,fontSize:12,cursor:'pointer',padding:9 }}>Cancel & Logout</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  USER PORTAL
// ══════════════════════════════════════════════════════════════
function UserPortal({ user, onLogout }) {
  const [tab, setTab] = useState('form');
  const [form, setForm] = useState({ empId:'', dept:'', type:'', printerType:'', desc:'' });
  const [submitting, setSubmitting] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [broadcast, setBroadcast] = useState(null);
  const sf = (k,v) => setForm(s=>({...s,[k]:v}));

  useEffect(() => {
    // Real-time complaints subscription
    const unsub1 = FireDB.subscribeComplaints(all => {
      const mine = all.filter(c => c.userId === user.username);
      setMyComplaints(mine);
      // Update selected if open
      if (selected) {
        const updated = mine.find(c => c._docId === selected._docId);
        if (updated) setSelected(updated);
      }
    });
    // Real-time broadcast subscription
    const unsub2 = FireDB.subscribeBroadcast(msg => setBroadcast(msg));
    return () => { unsub1(); unsub2(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.username]);

  const submit = async () => {
    if (!form.empId.trim()||!form.dept||!form.type||!form.desc.trim()) {
      alert('Please fill all required fields'); return;
    }
    if (form.type==='Printer' && !form.printerType) {
      alert('Please select printer type'); return;
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
      printerType: form.type==='Printer' ? form.printerType : '',
      desc: form.desc.trim(),
      status: 'submitted',
      at: now(),
      history: [{ status:'submitted', at:now(), by:user.displayName, note:'Complaint submitted successfully.' }],
      resolvedBy:'', solution:'', resolvedAt:'', pendingReason:'', refuseReason:''
    };
    await FireDB.addComplaint(ticket);
    setLastTicket(ticket);
    setForm({ empId:'', dept:'', type:'', printerType:'', desc:'' });
    setSubmitting(false);
    setTab('status');
  };

  const countByStatus = useMemo(() => {
    const r={submitted:0,pending:0,resolved:0,refused:0,closed:0};
    myComplaints.forEach(c=>{ if(r[c.status]!==undefined) r[c.status]++; });
    return r;
  }, [myComplaints]);

  return (
    <div style={{ minHeight:'100vh',background:C.off }}>
      <style>{GS}</style>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy3})`,
        position:'sticky',top:0,zIndex:50,boxShadow:'0 2px 20px #0a162840' }}>
        {/* Broadcast Banner */}
        <BroadcastBanner message={broadcast} />
        <div style={{ maxWidth:860,margin:'0 auto',padding:'0 16px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',height:62 }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:40,height:40,borderRadius:12,
                background:'linear-gradient(135deg,rgba(201,168,76,0.3),rgba(201,168,76,0.1))',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                border:'1px solid rgba(201,168,76,0.3)' }}>🏥</div>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:'#fff',lineHeight:1.2,
                  fontFamily:"'Cormorant Garamond',serif" }}>Choithram Hospital</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.55)',letterSpacing:.3 }}>IT Hardware Helpdesk</div>
              </div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div className="hide-sm" style={{ textAlign:'right' }}>
                <div style={{ fontSize:13,fontWeight:600,color:'#fff' }}>{user.displayName}</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)' }}>Employee Portal</div>
              </div>
              <Btn onClick={onLogout} variant="ghost" size="sm"
                style={{ color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.2)' }}>
                Logout
              </Btn>
            </div>
          </div>
          <div style={{ display:'flex',gap:0 }}>
            {[['form','📝 New Complaint'],['status','📋 My Complaints']].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)}
                style={{ padding:'11px 20px',background:'none',border:'none',
                  borderBottom:`2.5px solid ${tab===k?C.gold:'transparent'}`,
                  color:tab===k?C.gold2:'rgba(255,255,255,0.5)',
                  fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',letterSpacing:.2 }}>
                {l}
                {k==='status'&&myComplaints.length>0 && (
                  <span style={{ background:C.gold,color:C.navy,borderRadius:99,
                    fontSize:10,padding:'1px 7px',marginLeft:6,fontWeight:700 }}>{myComplaints.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:860,margin:'0 auto',padding:'24px 16px' }}>
        {/* NEW COMPLAINT FORM */}
        {tab==='form' && (
          <div className="fadeUp">
            {lastTicket && (
              <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                border:`2px solid ${C.green}`,borderRadius:16,
                padding:22,marginBottom:22,display:'flex',gap:16,alignItems:'flex-start',
                boxShadow:'0 4px 16px #06594620' }}>
                <div style={{ fontSize:36,flexShrink:0 }}>✅</div>
                <div>
                  <div style={{ fontWeight:700,fontSize:17,color:C.green,fontFamily:"'Cormorant Garamond',serif" }}>
                    Complaint Submitted Successfully!
                  </div>
                  <div style={{ color:C.text2,fontSize:13,marginTop:6 }}>Your Ticket ID:</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,
                    color:C.navy,marginTop:4,letterSpacing:1.5,
                    background:C.goldL,padding:'6px 14px',borderRadius:8,
                    display:'inline-block',border:`1px solid ${C.gold}` }}>{lastTicket.id}</div>
                  <div style={{ fontSize:12,color:C.muted,marginTop:8 }}>
                    📌 Save this Ticket ID to track your complaint status.
                  </div>
                </div>
              </div>
            )}

            <Card style={{ padding:28 }}>
              <div style={{ marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                  <div style={{ width:4,height:28,background:`linear-gradient(${C.navy},${C.gold})`,borderRadius:2 }}/>
                  <h2 style={{ fontWeight:700,fontSize:20,color:C.text,fontFamily:"'Cormorant Garamond',serif" }}>
                    Submit Hardware Complaint
                  </h2>
                </div>
                <p style={{ color:C.muted,fontSize:13,marginLeft:14 }}>
                  Fill all fields carefully. Your ticket will be assigned immediately.
                </p>
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px' }} className="grid-2">
                <div style={{ marginBottom:18 }}>
                  <FieldLabel required>Employee ID</FieldLabel>
                  <input value={form.empId} onChange={e=>sf('empId',e.target.value)}
                    placeholder="e.g. EMP-0001" style={inputStyle} />
                </div>
                <div style={{ position:'relative',marginBottom:18 }}>
                  <SearchDropdown
                    label="Department" required
                    value={form.dept} onChange={v=>sf('dept',v)}
                    options={DEPARTMENTS} placeholder="Search department..." />
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <FieldLabel required>Complaint Type</FieldLabel>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10 }} className="grid-3">
                  {COMPLAINT_TYPES.map(t=>{
                    const icons={Hardware:'🖥️',Network:'🌐',Software:'💿',Printer:'🖨️','PC Shifting':'🔄'};
                    const sel=form.type===t;
                    return (
                      <button key={t} onClick={()=>{ sf('type',t); sf('printerType',''); }}
                        style={{ padding:'14px 8px',borderRadius:12,cursor:'pointer',
                          border:`2px solid ${sel?C.navy:C.border}`,
                          background:sel?`linear-gradient(135deg,${C.navy},${C.navy3})`:'#f7f8fc',
                          color:sel?'#fff':C.muted,
                          fontWeight:sel?700:500,fontSize:12,textAlign:'center',transition:'all .18s',
                          boxShadow:sel?'0 4px 14px #0a162830':'none' }}>
                        <div style={{ fontSize:22,marginBottom:5 }}>{icons[t]}</div>
                        <div style={{ letterSpacing:.2 }}>{t}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.type==='Printer' && (
                <div className="fadeIn" style={{ marginBottom:18 }}>
                  <FieldLabel required>Printer / Device Type</FieldLabel>
                  <select value={form.printerType} onChange={e=>sf('printerType',e.target.value)}
                    style={{ ...inputStyle,color:form.printerType?C.text:C.muted }}>
                    <option value="">— Select printer type —</option>
                    {PRINTER_SUBTYPES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}

              <div style={{ marginBottom:24 }}>
                <FieldLabel required>Complaint Description</FieldLabel>
                <textarea value={form.desc} onChange={e=>sf('desc',e.target.value)}
                  rows={4} placeholder="Describe your issue in detail — what happened, since when, any error messages..."
                  style={{ ...inputStyle,resize:'vertical' }} />
              </div>

              <Btn onClick={submit} disabled={submitting} style={{ padding:'13px 32px' }} size="lg" variant="primary">
                {submitting?'⏳ Submitting...':'📤 Submit Complaint'}
              </Btn>
            </Card>
          </div>
        )}

        {/* MY COMPLAINTS */}
        {tab==='status' && (
          <div className="fadeUp">
            {/* Live indicator + Summary */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10 }}>
              <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                {Object.entries(countByStatus).filter(([,v])=>v>0).map(([k,v])=>(
                  <div key={k} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
                    padding:'8px 16px',display:'flex',alignItems:'center',gap:8,
                    boxShadow:'0 1px 6px #0a162808' }}>
                    <span style={{ width:8,height:8,borderRadius:'50%',background:STATUS_CFG[k]?.dot }}/>
                    <span style={{ fontSize:12,color:C.muted,fontWeight:500 }}>{STATUS_CFG[k]?.label}:</span>
                    <span style={{ fontSize:15,fontWeight:700,color:C.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#059669',fontWeight:600 }}>
                <span style={{ width:8,height:8,borderRadius:'50%',background:'#10b981',
                  animation:'pulse 2s infinite',display:'inline-block' }}/>
                Live Updates
              </div>
            </div>

            {myComplaints.length===0 ? (
              <Card style={{ textAlign:'center',padding:56 }}>
                <div style={{ fontSize:52,marginBottom:14 }}>📭</div>
                <div style={{ fontWeight:700,color:C.muted,fontSize:16,fontFamily:"'Cormorant Garamond',serif" }}>No complaints yet</div>
                <div style={{ color:C.muted,fontSize:13,marginTop:6 }}>Submit your first complaint using the form tab</div>
              </Card>
            ) : (
              <div style={{ display:'grid',gap:14 }}>
                {myComplaints.map(c=>(
                  <Card key={c._docId||c.id} style={{ padding:20,cursor:'pointer',transition:'all .2s' }}
                    onClick={()=>setSelected(c)}
                    onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 6px 24px #0a162818'; e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 2px 12px #0a162810'; e.currentTarget.style.transform='none'; }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:8 }}>
                      <div>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                          color:C.navy,fontWeight:700,marginBottom:4,letterSpacing:1,
                          background:C.goldL,padding:'3px 10px',borderRadius:6,
                          border:`1px solid ${C.gold}`,display:'inline-block' }}>{c.id}</div>
                        <div style={{ fontWeight:700,fontSize:16,color:C.text,marginTop:6,
                          fontFamily:"'Cormorant Garamond',serif" }}>
                          {c.type}{c.printerType?` — ${c.printerType}`:''}
                        </div>
                        <div style={{ fontSize:12,color:C.muted,marginTop:3 }}>
                          📍 {c.dept} &nbsp;·&nbsp; 🕐 {fmtDT(c.at)}
                        </div>
                      </div>
                      <Badge status={c.status}/>
                    </div>
                    <div style={{ background:C.off,borderRadius:10,padding:'10px 14px',
                      fontSize:13,color:C.text2,lineHeight:1.6,border:`1px solid ${C.border}` }}>
                      {c.desc.length>120?c.desc.substring(0,120)+'…':c.desc}
                    </div>

                    {/* Status-specific info */}
                    {c.status==='resolved' && (
                      <div style={{ marginTop:10,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                        {c.solution && (
                          <div style={{ padding:'10px 13px',background:C.greenL,borderRadius:10,
                            fontSize:12,color:C.green,fontWeight:600,border:`1px solid #a7f3d0` }}>
                            ✅ <strong>Solution:</strong> {c.solution}
                          </div>
                        )}
                        {c.resolvedBy && (
                          <div style={{ padding:'10px 13px',background:'#f0fdf4',borderRadius:10,
                            fontSize:12,color:C.green,border:`1px solid #a7f3d0` }}>
                            👤 <strong>Resolved by:</strong> {c.resolvedBy}
                          </div>
                        )}
                      </div>
                    )}
                    {c.status==='pending' && c.pendingReason && (
                      <div style={{ marginTop:10,padding:'10px 13px',background:C.yellowL,
                        borderRadius:10,fontSize:12,color:C.yellow,fontWeight:500,border:`1px solid #fde68a` }}>
                        ⏳ <strong>Pending Reason:</strong> {c.pendingReason}
                      </div>
                    )}
                    {c.status==='refused' && c.refuseReason && (
                      <div style={{ marginTop:10,padding:'10px 13px',background:C.redL,
                        borderRadius:10,fontSize:12,color:C.red,fontWeight:500,border:`1px solid #fca5a5` }}>
                        ❌ <strong>Refused Reason:</strong> {c.refuseReason}
                      </div>
                    )}

                    <div style={{ fontSize:12,color:C.accent,marginTop:10,fontWeight:600 }}>
                      📋 Tap to view full details & history →
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)}
        title={`${selected?.id} — Full Details`} width={580}>
        {selected && (
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18 }} className="grid-2">
              {[
                ['Ticket ID', selected.id, C.navy, true],
                ['Current Status', STATUS_CFG[selected.status]?.label, STATUS_CFG[selected.status]?.color, false],
                ['Employee ID', selected.empId, C.text, false],
                ['Department', selected.dept, C.text, false],
                ['Complaint Type', selected.type+(selected.printerType?` (${selected.printerType})`:''), C.text, false],
                ['Submitted On', fmtDT(selected.at), C.muted, false],
                ...(selected.status==='resolved'?[
                  ['Resolved By', selected.resolvedBy||'—', C.green, false],
                  ['Resolved At', fmtDT(selected.resolvedAt)||'—', C.green, false],
                ]:[])
              ].map(([k,v,c,mono])=>(
                <div key={k} style={{ background:C.off,borderRadius:10,padding:'10px 14px',border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:4,textTransform:'uppercase' }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:700,color:c,
                    fontFamily:mono?"'JetBrains Mono',monospace":"inherit" }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ background:C.off,borderRadius:10,padding:'12px 14px',marginBottom:18,border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:6,textTransform:'uppercase' }}>Issue Description</div>
              <div style={{ fontSize:13,color:C.text2,lineHeight:1.7 }}>{selected.desc}</div>
            </div>

            {selected.solution && (
              <div style={{ background:C.greenL,borderRadius:10,padding:'12px 14px',marginBottom:18,border:`1px solid #a7f3d0` }}>
                <div style={{ fontSize:10,color:C.green,fontWeight:700,letterSpacing:.6,marginBottom:6,textTransform:'uppercase' }}>✅ Solution Applied</div>
                <div style={{ fontSize:13,color:C.green,lineHeight:1.6,fontWeight:500 }}>{selected.solution}</div>
              </div>
            )}

            <div style={{ fontSize:11,color:C.muted,fontWeight:700,marginBottom:14,letterSpacing:.6,
              textTransform:'uppercase',borderBottom:`1px solid ${C.border}`,paddingBottom:10 }}>
              📜 Status History Timeline
            </div>
            <Timeline history={selected.history}/>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ADMIN PORTAL
// ══════════════════════════════════════════════════════════════
function AdminPortal({ user, onLogout }) {
  const [tab, setTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ dept:'',type:'',status:'',search:'',from:'',to:'' });
  const [actionModal, setActionModal] = useState(null);
  const [actionType, setActionType] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [pwModal, setPwModal] = useState(false);
  const [actionForm, setActionForm] = useState({ resolvedBy:'',solution:'',reason:'' });
  const [newAdminPw, setNewAdminPw] = useState({ pw1:'',pw2:'' });
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [resetPwModal, setResetPwModal] = useState(null);
  const [newPwForUser, setNewPwForUser] = useState('');
  const [broadcast, setBroadcast] = useState(null);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const af = (k,v) => setActionForm(s=>({...s,[k]:v}));
  const setF = (k,v) => setFilters(s=>({...s,[k]:v}));

  useEffect(() => {
    const unsub1 = FireDB.subscribeComplaints(data => setComplaints(data));
    const unsub2 = FireDB.subscribeBroadcast(msg => setBroadcast(msg));
    const loadUsers = async () => {
      const u = await FireDB.getUsers();
      if (u) setUsers(u);
    };
    loadUsers();
    return () => { unsub1(); unsub2(); };
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter(c=>{
      if (filters.dept && c.dept!==filters.dept) return false;
      if (filters.type && c.type!==filters.type) return false;
      if (filters.status && c.status!==filters.status) return false;
      if (filters.from && new Date(c.at)<new Date(filters.from)) return false;
      if (filters.to && new Date(c.at)>new Date(filters.to+'T23:59:59')) return false;
      if (filters.search) {
        const s=filters.search.toLowerCase();
        if (!c.userName?.toLowerCase().includes(s)&&!c.empId?.toLowerCase().includes(s)&&
          !c.id?.toLowerCase().includes(s)&&!c.dept?.toLowerCase().includes(s)&&
          !c.desc?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [complaints, filters]);

  const stats = useMemo(()=>{
    const a=complaints;
    return {
      total:a.length,
      submitted:a.filter(c=>c.status==='submitted').length,
      pending:a.filter(c=>c.status==='pending').length,
      resolved:a.filter(c=>c.status==='resolved'||c.status==='closed').length,
      refused:a.filter(c=>c.status==='refused').length,
    };
  },[complaints]);

  const openAction = (complaint, type) => {
    setActionModal(complaint);
    setActionType(type);
    setActionForm({ resolvedBy:'',solution:'',reason:'' });
  };

  const doAction = async () => {
    const c = actionModal;
    const type = actionType;
    let newStatus='', histEntry={};
    if (type==='resolve') {
      if (!actionForm.resolvedBy.trim()||!actionForm.solution.trim()) { alert('Fill all fields'); return; }
      newStatus='resolved';
      histEntry={status:'resolved',at:now(),by:actionForm.resolvedBy,
        note:`Issue resolved successfully. Solution: ${actionForm.solution}`};
    } else if (type==='pending') {
      if (!actionForm.reason.trim()) { alert('Please enter reason'); return; }
      newStatus='pending';
      histEntry={status:'pending',at:now(),by:user.displayName,
        note:`Marked as pending. Reason: ${actionForm.reason}`};
    } else if (type==='refuse') {
      if (!actionForm.reason.trim()) { alert('Please enter reason'); return; }
      newStatus='refused';
      histEntry={status:'refused',at:now(),by:user.displayName,
        note:`Complaint refused. Reason: ${actionForm.reason}`};
    } else if (type==='close') {
      newStatus='closed';
      histEntry={status:'closed',at:now(),by:user.displayName,
        note:actionForm.reason?`Complaint closed. Note: ${actionForm.reason}`:'Complaint has been closed.'};
    }
    const updData = {
      status: newStatus,
      history: [...(c.history||[]), histEntry],
      ...(type==='resolve'?{ resolvedBy:actionForm.resolvedBy, solution:actionForm.solution, resolvedAt:now() }:{}),
      ...(type==='pending'?{ pendingReason:actionForm.reason }:{}),
      ...(type==='refuse'?{ refuseReason:actionForm.reason }:{}),
    };
    await FireDB.updateComplaint(c._docId, updData);
    setActionModal(null);
    setDetailModal(null);
  };

  const handleDelete = async (complaint) => {
    await FireDB.deleteComplaint(complaint._docId);
    setDeleteConfirm(null);
    setDetailModal(null);
  };

  const exportCSV = () => {
    const hdr = ['Ticket ID','User Name','Emp ID','Department','Type','Sub Type','Description','Status','Submitted','Resolved By','Solution','Pending Reason','Refused Reason'];
    const rows = filtered.map(c=>[
      c.id,c.userName,c.empId,c.dept,c.type,c.printerType||'',
      `"${(c.desc||'').replace(/"/g,'""')}"`,c.status,
      fmtDT(c.at),c.resolvedBy||'',c.solution||'',c.pendingReason||'',c.refuseReason||''
    ]);
    const csv = [hdr,...rows].map(r=>r.join(',')).join('\n');
    const a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,\ufeff'+encodeURIComponent(csv);
    a.download=`CHRC_IT_Complaints_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const sendBroadcast = async () => {
    if (!broadcastInput.trim()) { alert('Please enter a message'); return; }
    await FireDB.setBroadcast(broadcastInput.trim(), user.displayName);
    setBroadcastInput('');
    setBroadcastModal(false);
  };

  const clearBroadcast = async () => {
    await FireDB.clearBroadcast();
  };

  const changeAdminPw = async () => {
    if(newAdminPw.pw1.length<6){alert('Min 6 chars');return;}
    if(newAdminPw.pw1!==newAdminPw.pw2){alert("Passwords don't match");return;}
    await FireDB.updateUser(user.username, { password: newAdminPw.pw1 });
    setPwModal(false); setNewAdminPw({pw1:'',pw2:''});
    alert('Password changed successfully!');
  };

  const resetUserPw = async () => {
    if(!newPwForUser.trim()){alert('Enter new password');return;}
    await FireDB.updateUser(resetPwModal.username, { password:newPwForUser, firstLogin:true });
    setResetPwModal(null); setNewPwForUser('');
    alert(`Password reset for ${resetPwModal.username}!`);
  };

  const chartData = useMemo(()=>{
    const map={};
    complaints.forEach(c=>{
      const d=new Date(c.at);
      const key=`${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
      if(!map[key]) map[key]={month:key,total:0,resolved:0,pending:0,refused:0};
      map[key].total++;
      if(['resolved','closed'].includes(c.status)) map[key].resolved++;
      else if(c.status==='pending') map[key].pending++;
      else if(c.status==='refused') map[key].refused++;
    });
    return Object.values(map).slice(-12);
  },[complaints]);

  const typeData = useMemo(()=>
    COMPLAINT_TYPES.map(t=>({ name:t,value:complaints.filter(c=>c.type===t).length }))
      .filter(d=>d.value>0),[complaints]);

  const CHART_COLORS=['#0a1628','#c9a84c','#059669','#dc2626','#7c3aed'];

  const filteredUsers = useMemo(()=>
    users.filter(u=>u.username?.includes(userSearch.toLowerCase())||
      (u.displayName||'').toLowerCase().includes(userSearch.toLowerCase()))
  ,[users,userSearch]);

  const TABS=[
    ['complaints','📋 Complaints'],
    ['analytics','📊 Analytics'],
    ['broadcast','📢 Broadcast'],
    ['users','👥 Users'],
  ];

  const selectStyle = { ...inputStyle,fontSize:12,padding:'9px 12px',height:40 };

  return (
    <div style={{ minHeight:'100vh',background:C.off }}>
      <style>{GS}</style>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,#0f2a50 60%,${C.navy3} 100%)`,
        position:'sticky',top:0,zIndex:50,boxShadow:'0 4px 24px #0a162850',borderBottom:`1px solid rgba(201,168,76,0.15)` }}>
        <div style={{ maxWidth:1400,margin:'0 auto',padding:'0 20px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',height:65 }}>
            <div style={{ display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:42,height:42,borderRadius:13,
                background:'linear-gradient(135deg,rgba(201,168,76,0.25),rgba(201,168,76,0.08))',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
                border:'1px solid rgba(201,168,76,0.35)' }}>⚙️</div>
              <div>
                <div style={{ fontWeight:700,fontSize:15,color:'#fff',lineHeight:1.2,
                  fontFamily:"'Cormorant Garamond',serif",letterSpacing:.3 }}>
                  Choithram Hospital — IT Admin Portal
                </div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.5)',letterSpacing:.3 }}>
                  Hardware Helpdesk Management System
                </div>
              </div>
            </div>
            <div style={{ display:'flex',gap:8,alignItems:'center' }}>
              <div className="hide-sm" style={{ fontSize:13,color:'rgba(255,255,255,0.7)',
                background:'rgba(255,255,255,0.08)',padding:'4px 12px',borderRadius:99 }}>
                {user.displayName}
              </div>
              <Btn onClick={()=>setPwModal(true)} variant="ghost" size="sm"
                style={{ color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.2)',fontSize:12 }}>
                🔑
              </Btn>
              <Btn onClick={onLogout} variant="ghost" size="sm"
                style={{ color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.2)',fontSize:12 }}>
                Logout
              </Btn>
            </div>
          </div>
          <div style={{ display:'flex',gap:0,overflowX:'auto' }}>
            {TABS.map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)}
                style={{ padding:'11px 20px',background:'none',border:'none',
                  borderBottom:`2.5px solid ${tab===k?C.gold:'transparent'}`,
                  color:tab===k?C.gold2:'rgba(255,255,255,0.5)',
                  fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',
                  whiteSpace:'nowrap',letterSpacing:.2 }}>
                {l}
                {k==='broadcast'&&broadcast?.active&&broadcast?.message&&(
                  <span style={{ width:7,height:7,borderRadius:'50%',background:'#f59e0b',
                    display:'inline-block',marginLeft:6,animation:'pulse 2s infinite' }}/>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400,margin:'0 auto',padding:'24px 20px' }}>
        {/* STATS ROW */}
        <div style={{ display:'flex',gap:14,marginBottom:24,flexWrap:'wrap' }}>
          <StatCard icon="📋" label="Total Complaints" value={stats.total} color={C.navy} bg={C.blueL}/>
          <StatCard icon="📤" label="Submitted" value={stats.submitted} color='#0369a1' bg='#e0f2fe'/>
          <StatCard icon="⏳" label="Pending" value={stats.pending} color={C.yellow} bg={C.yellowL}/>
          <StatCard icon="✅" label="Resolved" value={stats.resolved} color={C.green} bg={C.greenL}/>
          <StatCard icon="❌" label="Refused" value={stats.refused} color={C.red} bg={C.redL}/>
        </div>

        {/* COMPLAINTS TAB */}
        {tab==='complaints' && (
          <div className="fadeUp">
            <Card style={{ padding:20,marginBottom:18 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10 }}>
                <div style={{ fontSize:12,color:C.muted,fontWeight:700,letterSpacing:.6,textTransform:'uppercase' }}>
                  🔍 Filter & Search
                </div>
                <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                  <Btn onClick={exportCSV} variant="outline" size="sm">📥 Export CSV</Btn>
                  <span style={{ fontSize:12,color:C.muted,alignSelf:'center',fontWeight:600 }}>
                    {filtered.length} of {complaints.length} records
                  </span>
                </div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:10 }}>
                <input value={filters.search} onChange={e=>setF('search',e.target.value)}
                  placeholder="Search name / ID / issue..."
                  style={{ ...inputStyle,fontSize:12,padding:'9px 12px',height:40 }}/>
                <select value={filters.status} onChange={e=>setF('status',e.target.value)} style={selectStyle}>
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filters.type} onChange={e=>setF('type',e.target.value)} style={selectStyle}>
                  <option value="">All Types</option>
                  {COMPLAINT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={filters.from} onChange={e=>setF('from',e.target.value)}
                  style={{ ...selectStyle }} title="From date"/>
                <input type="date" value={filters.to} onChange={e=>setF('to',e.target.value)}
                  style={{ ...selectStyle }} title="To date"/>
                <Btn onClick={()=>setFilters({ dept:'',type:'',status:'',search:'',from:'',to:'' })}
                  variant="ghost" size="sm" style={{ height:40 }}>Clear</Btn>
              </div>
            </Card>

            {filtered.length===0 ? (
              <Card style={{ textAlign:'center',padding:48 }}>
                <div style={{ fontSize:44,marginBottom:12 }}>🔍</div>
                <div style={{ fontWeight:600,color:C.muted }}>No complaints match your filters</div>
              </Card>
            ) : (
              <div style={{ display:'grid',gap:12 }}>
                {filtered.map(c=>(
                  <Card key={c._docId||c.id} style={{ padding:20,transition:'all .2s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 6px 24px #0a162820'; e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 2px 12px #0a162810'; e.currentTarget.style.transform='none'; }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:10 }}>
                      <div>
                        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap' }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                            color:C.navy,fontWeight:700,letterSpacing:1,
                            background:C.goldL,padding:'3px 10px',borderRadius:6,
                            border:`1px solid ${C.gold}` }}>{c.id}</span>
                          <Badge status={c.status}/>
                          <span style={{ fontSize:12,color:C.muted }}>
                            {c.type}{c.printerType?` · ${c.printerType}`:''}
                          </span>
                        </div>
                        <div style={{ fontSize:15,fontWeight:700,color:C.text,
                          fontFamily:"'Cormorant Garamond',serif" }}>
                          {c.userName} <span style={{ fontSize:13,color:C.muted,fontWeight:400 }}>({c.empId})</span>
                        </div>
                        <div style={{ fontSize:12,color:C.muted,marginTop:3 }}>
                          📍 {c.dept} &nbsp;·&nbsp; 🕐 {fmtDT(c.at)}
                        </div>
                      </div>
                      <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                        <Btn onClick={()=>setDetailModal(c)} variant="outline" size="sm">View</Btn>
                        {(c.status==='submitted'||c.status==='pending') && (
                          <>
                            <Btn onClick={()=>openAction(c,'resolve')} variant="success" size="sm">✅ Resolve</Btn>
                            <Btn onClick={()=>openAction(c,'pending')} variant="warning" size="sm">⏳ Pending</Btn>
                            <Btn onClick={()=>openAction(c,'refuse')} variant="danger" size="sm">❌ Refuse</Btn>
                          </>
                        )}
                        {c.status==='resolved' && (
                          <Btn onClick={()=>openAction(c,'close')} variant="ghost" size="sm">🔒 Close</Btn>
                        )}
                        <Btn onClick={()=>setDeleteConfirm(c)} variant="danger" size="sm">🗑️</Btn>
                      </div>
                    </div>
                    <div style={{ background:C.off,borderRadius:10,padding:'9px 13px',
                      fontSize:13,color:C.text2,lineHeight:1.5,border:`1px solid ${C.border}` }}>
                      {c.desc?.length>140?c.desc.substring(0,140)+'…':c.desc}
                    </div>
                    {c.status==='resolved' && (
                      <div style={{ marginTop:10,display:'flex',gap:8,flexWrap:'wrap' }}>
                        {c.solution && (
                          <div style={{ padding:'7px 12px',background:C.greenL,borderRadius:8,
                            fontSize:12,color:C.green,fontWeight:500,border:`1px solid #a7f3d0`,flex:1 }}>
                            ✅ {c.solution}
                          </div>
                        )}
                        {c.resolvedBy && (
                          <div style={{ padding:'7px 12px',background:'#f0fdf4',borderRadius:8,
                            fontSize:12,color:C.green,border:`1px solid #a7f3d0` }}>
                            👤 {c.resolvedBy}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab==='analytics' && (
          <div className="fadeUp">
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18 }} className="grid-2">
              <Card style={{ padding:22 }}>
                <div style={{ fontWeight:700,fontSize:16,marginBottom:18,color:C.text,
                  fontFamily:"'Cormorant Garamond',serif" }}>Monthly Complaint Trend</div>
                {chartData.length===0 ? (
                  <div style={{ textAlign:'center',color:C.muted,padding:40 }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData} margin={{ top:5,right:5,bottom:5,left:-20 }}>
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.navy} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={C.navy} stopOpacity={0.02}/>
                        </linearGradient>
                        <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                      <XAxis dataKey="month" tick={{ fontSize:11,fill:C.muted }}/>
                      <YAxis tick={{ fontSize:11,fill:C.muted }}/>
                      <Tooltip contentStyle={{ borderRadius:10,border:`1px solid ${C.border}`,fontSize:12 }}/>
                      <Legend wrapperStyle={{ fontSize:12 }}/>
                      <Area type="monotone" dataKey="total" stroke={C.navy} strokeWidth={2}
                        fill="url(#totalGrad)" name="Total"/>
                      <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2}
                        fill="url(#resolvedGrad)" name="Resolved"/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card style={{ padding:22 }}>
                <div style={{ fontWeight:700,fontSize:16,marginBottom:18,color:C.text,
                  fontFamily:"'Cormorant Garamond',serif" }}>Complaint Types</div>
                {typeData.length===0 ? (
                  <div style={{ textAlign:'center',color:C.muted,padding:40 }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                        dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                        labelLine={false} fontSize={11}>
                        {typeData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius:10,fontSize:12 }}/>
                      <Legend wrapperStyle={{ fontSize:12 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            <Card style={{ padding:22 }}>
              <div style={{ fontWeight:700,fontSize:16,marginBottom:18,color:C.text,
                fontFamily:"'Cormorant Garamond',serif" }}>Monthly Status Breakdown</div>
              {chartData.length===0 ? (
                <div style={{ textAlign:'center',color:C.muted,padding:40 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top:5,right:5,bottom:5,left:-20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                    <XAxis dataKey="month" tick={{ fontSize:11,fill:C.muted }}/>
                    <YAxis tick={{ fontSize:11,fill:C.muted }}/>
                    <Tooltip contentStyle={{ borderRadius:10,fontSize:12 }}/>
                    <Legend wrapperStyle={{ fontSize:12 }}/>
                    <Bar dataKey="resolved" fill="#059669" name="Resolved" radius={[4,4,0,0]}/>
                    <Bar dataKey="pending" fill="#d97706" name="Pending" radius={[4,4,0,0]}/>
                    <Bar dataKey="refused" fill="#dc2626" name="Refused" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        )}

        {/* BROADCAST TAB */}
        {tab==='broadcast' && (
          <div className="fadeUp">
            <Card style={{ padding:28,marginBottom:18 }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20,
                paddingBottom:18,borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:48,height:48,borderRadius:14,
                  background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>📢</div>
                <div>
                  <h2 style={{ fontWeight:700,fontSize:20,color:C.text,fontFamily:"'Cormorant Garamond',serif" }}>
                    Broadcast Message
                  </h2>
                  <p style={{ color:C.muted,fontSize:13 }}>Send an announcement to all users on the portal</p>
                </div>
              </div>

              {/* Current broadcast status */}
              {broadcast?.active && broadcast?.message ? (
                <div style={{ background:'linear-gradient(135deg,#f3e8ff,#ede9fe)',
                  borderRadius:14,padding:20,marginBottom:20,border:`1px solid #c4b5fd` }}>
                  <div style={{ fontWeight:700,color:'#5b21b6',fontSize:12,letterSpacing:.6,
                    textTransform:'uppercase',marginBottom:8 }}>📡 Currently Active Message</div>
                  <div style={{ fontSize:15,color:'#3b0764',lineHeight:1.6,fontWeight:500 }}>{broadcast.message}</div>
                  <div style={{ fontSize:11,color:'#7c3aed',marginTop:8 }}>
                    By {broadcast.by} · {fmtDT(broadcast.at)}
                  </div>
                  <Btn onClick={clearBroadcast} variant="danger" size="sm" style={{ marginTop:14 }}>
                    🗑️ Delete Broadcast Message
                  </Btn>
                </div>
              ) : (
                <div style={{ background:C.off,borderRadius:14,padding:20,marginBottom:20,
                  border:`1px solid ${C.border}`,textAlign:'center' }}>
                  <div style={{ fontSize:32,marginBottom:8 }}>🔕</div>
                  <div style={{ color:C.muted,fontSize:14,fontWeight:500 }}>No active broadcast message</div>
                </div>
              )}

              <div style={{ marginBottom:16 }}>
                <FieldLabel>New Broadcast Message</FieldLabel>
                <textarea value={broadcastInput} onChange={e=>setBroadcastInput(e.target.value)}
                  rows={4} placeholder="Type your announcement here — it will appear on all user screens immediately..."
                  style={{ ...inputStyle,resize:'vertical' }}/>
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <Btn onClick={sendBroadcast} variant="primary" size="md"
                  style={{ background:'linear-gradient(135deg,#5b21b6,#7c3aed)',border:'none' }}>
                  📢 Send Broadcast
                </Btn>
                {broadcast?.active && broadcast?.message && (
                  <Btn onClick={clearBroadcast} variant="ghost" size="md">Clear Active</Btn>
                )}
              </div>
            </Card>

            <div style={{ background:C.blueL,borderRadius:14,padding:18,border:`1px solid #bfdbfe` }}>
              <div style={{ fontWeight:600,color:C.blue,fontSize:14,marginBottom:8 }}>ℹ️ How Broadcast Works</div>
              <ul style={{ color:C.text2,fontSize:13,lineHeight:2,paddingLeft:18 }}>
                <li>Message appears instantly on all user portals as a banner</li>
                <li>Users see it at the top of every page when logged in</li>
                <li>Only one broadcast can be active at a time</li>
                <li>Delete the message when the announcement is no longer needed</li>
              </ul>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab==='users' && (
          <div className="fadeUp">
            <Card style={{ padding:20,marginBottom:16 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10 }}>
                <div style={{ fontWeight:700,fontSize:16,color:C.text,fontFamily:"'Cormorant Garamond',serif" }}>
                  User Management
                </div>
                <span style={{ fontSize:12,color:C.muted,fontWeight:600 }}>{filteredUsers.length} users</span>
              </div>
              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)}
                placeholder="Search by username or name..."
                style={{ ...inputStyle,marginBottom:0 }}/>
            </Card>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12 }}>
              {filteredUsers.slice(0,100).map(u=>(
                <Card key={u.username} style={{ padding:16 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                    <div style={{ display:'flex',gap:12,alignItems:'center' }}>
                      <div style={{ width:40,height:40,borderRadius:12,
                        background:u.role==='admin'?`linear-gradient(135deg,${C.gold},#b8860b)`:`linear-gradient(135deg,${C.navy},#1a3a6b)`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:16,color:'#fff',fontWeight:700,flexShrink:0 }}>
                        {(u.displayName||u.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:14,color:C.text,lineHeight:1.2 }}>{u.displayName||u.username}</div>
                        <div style={{ fontSize:11,color:C.muted,marginTop:2,fontFamily:"'JetBrains Mono',monospace" }}>{u.username}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:10,padding:'3px 9px',borderRadius:99,fontWeight:700,
                      background:u.role==='admin'?C.goldL:C.blueL,
                      color:u.role==='admin'?'#7c2d12':C.blue,letterSpacing:.3,textTransform:'uppercase' }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{ display:'flex',gap:8,justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontSize:11,color:u.firstLogin?C.yellow:C.green,fontWeight:600 }}>
                      {u.firstLogin?'⚠️ Default pw':'✅ Custom pw'}
                    </span>
                    <Btn onClick={()=>{ setResetPwModal(u); setNewPwForUser(''); }} variant="ghost" size="sm">
                      🔑 Reset
                    </Btn>
                  </div>
                </Card>
              ))}
            </div>
            {filteredUsers.length>100 && (
              <div style={{ textAlign:'center',color:C.muted,fontSize:13,marginTop:16 }}>
                Showing first 100 of {filteredUsers.length} users. Use search to find specific users.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)}
        title={`${detailModal?.id} — Full Details`} width={620}>
        {detailModal && (
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18 }} className="grid-2">
              {[
                ['Ticket ID', detailModal.id, C.navy, true],
                ['Status', STATUS_CFG[detailModal.status]?.label, STATUS_CFG[detailModal.status]?.color, false],
                ['Employee', detailModal.userName, C.text, false],
                ['Emp ID', detailModal.empId, C.text, false],
                ['Department', detailModal.dept, C.text, false],
                ['Type', detailModal.type+(detailModal.printerType?` (${detailModal.printerType})`:''), C.text, false],
                ['Submitted', fmtDT(detailModal.at), C.muted, false],
                ...(detailModal.status==='resolved'?[
                  ['Resolved By', detailModal.resolvedBy||'—', C.green, false],
                  ['Resolved At', fmtDT(detailModal.resolvedAt)||'—', C.green, false],
                ]:[])
              ].map(([k,v,c,mono])=>(
                <div key={k} style={{ background:C.off,borderRadius:10,padding:'10px 14px',border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:4,textTransform:'uppercase' }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:700,color:c,
                    fontFamily:mono?"'JetBrains Mono',monospace":"inherit" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.off,borderRadius:10,padding:'12px 14px',marginBottom:18,border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:6,textTransform:'uppercase' }}>Issue Description</div>
              <div style={{ fontSize:13,color:C.text2,lineHeight:1.7 }}>{detailModal.desc}</div>
            </div>
            {detailModal.solution && (
              <div style={{ background:C.greenL,borderRadius:10,padding:'12px 14px',marginBottom:18,border:`1px solid #a7f3d0` }}>
                <div style={{ fontSize:10,color:C.green,fontWeight:700,letterSpacing:.6,marginBottom:6,textTransform:'uppercase' }}>Solution</div>
                <div style={{ fontSize:13,color:C.green,lineHeight:1.6 }}>{detailModal.solution}</div>
              </div>
            )}
            <div style={{ fontSize:11,color:C.muted,fontWeight:700,marginBottom:14,letterSpacing:.6,textTransform:'uppercase' }}>Timeline</div>
            <Timeline history={detailModal.history}/>
            <div style={{ marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`,display:'flex',gap:8,flexWrap:'wrap' }}>
              {(detailModal.status==='submitted'||detailModal.status==='pending') && (
                <>
                  <Btn onClick={()=>{ openAction(detailModal,'resolve'); setDetailModal(null); }} variant="success" size="sm">✅ Resolve</Btn>
                  <Btn onClick={()=>{ openAction(detailModal,'pending'); setDetailModal(null); }} variant="warning" size="sm">⏳ Pending</Btn>
                  <Btn onClick={()=>{ openAction(detailModal,'refuse'); setDetailModal(null); }} variant="danger" size="sm">❌ Refuse</Btn>
                </>
              )}
              {detailModal.status==='resolved' && (
                <Btn onClick={()=>{ openAction(detailModal,'close'); setDetailModal(null); }} variant="ghost" size="sm">🔒 Close</Btn>
              )}
              <Btn onClick={()=>{ setDeleteConfirm(detailModal); setDetailModal(null); }} variant="danger" size="sm">🗑️ Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal open={!!actionModal} onClose={()=>setActionModal(null)}
        title={actionType==='resolve'?'✅ Resolve Complaint':actionType==='pending'?'⏳ Mark as Pending':actionType==='refuse'?'❌ Refuse Complaint':'🔒 Close Complaint'}
        width={480}>
        {actionModal && (
          <div>
            <div style={{ background:C.off,borderRadius:10,padding:'10px 14px',marginBottom:18,border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.3 }}>TICKET</div>
              <div style={{ fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.navy }}>{actionModal.id}</div>
              <div style={{ fontSize:12,color:C.text2,marginTop:2 }}>{actionModal.userName} · {actionModal.dept}</div>
            </div>
            {actionType==='resolve' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <FieldLabel required>Resolved By (Technician Name)</FieldLabel>
                  <input value={actionForm.resolvedBy} onChange={e=>af('resolvedBy',e.target.value)}
                    placeholder="Enter technician / staff name" style={inputStyle}/>
                </div>
                <div style={{ marginBottom:18 }}>
                  <FieldLabel required>Solution / Action Taken</FieldLabel>
                  <textarea value={actionForm.solution} onChange={e=>af('solution',e.target.value)}
                    rows={3} placeholder="Describe what was done to fix the issue..."
                    style={{ ...inputStyle,resize:'vertical' }}/>
                </div>
                <Btn onClick={doAction} variant="success" size="md" style={{ width:'100%' }}>✅ Mark as Resolved</Btn>
              </>
            )}
            {(actionType==='pending'||actionType==='refuse') && (
              <>
                <div style={{ marginBottom:18 }}>
                  <FieldLabel required>{actionType==='pending'?'Reason for Pending':'Reason for Refusal'}</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e=>af('reason',e.target.value)}
                    rows={3} placeholder={actionType==='pending'?'Why is this pending?':'Why is this being refused?'}
                    style={{ ...inputStyle,resize:'vertical' }}/>
                </div>
                <Btn onClick={doAction} variant={actionType==='pending'?'warning':'danger'} size="md" style={{ width:'100%' }}>
                  {actionType==='pending'?'⏳ Mark as Pending':'❌ Refuse Complaint'}
                </Btn>
              </>
            )}
            {actionType==='close' && (
              <>
                <div style={{ marginBottom:18 }}>
                  <FieldLabel>Closing Note (Optional)</FieldLabel>
                  <textarea value={actionForm.reason} onChange={e=>af('reason',e.target.value)}
                    rows={3} placeholder="Any final note before closing..." style={{ ...inputStyle,resize:'vertical' }}/>
                </div>
                <Btn onClick={doAction} variant="ghost" size="md" style={{ width:'100%' }}>🔒 Close Complaint</Btn>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={()=>setDeleteConfirm(null)} title="🗑️ Delete Complaint" width={400}>
        {deleteConfirm && (
          <div>
            <div style={{ background:C.redL,borderRadius:12,padding:18,marginBottom:18,textAlign:'center' }}>
              <div style={{ fontSize:36,marginBottom:10 }}>⚠️</div>
              <div style={{ fontWeight:700,color:C.red,fontSize:16,marginBottom:6 }}>Confirm Deletion</div>
              <div style={{ color:C.red,fontSize:13,lineHeight:1.6 }}>
                You are about to permanently delete:<br/>
                <strong>{deleteConfirm.id}</strong><br/>
                <span style={{ fontSize:12,opacity:.8 }}>This action cannot be undone and the complaint will be removed from Firebase.</span>
              </div>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <Btn onClick={()=>setDeleteConfirm(null)} variant="ghost" size="md" style={{ flex:1 }}>Cancel</Btn>
              <Btn onClick={()=>handleDelete(deleteConfirm)} variant="danger" size="md" style={{ flex:1 }}>Delete Permanently</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal open={pwModal} onClose={()=>setPwModal(false)} title="🔑 Change Admin Password" width={400}>
        <div style={{ marginBottom:16 }}>
          <FieldLabel>New Password</FieldLabel>
          <input type="password" value={newAdminPw.pw1} onChange={e=>setNewAdminPw(s=>({...s,pw1:e.target.value}))}
            placeholder="Min 6 characters" style={inputStyle}/>
        </div>
        <div style={{ marginBottom:18 }}>
          <FieldLabel>Confirm Password</FieldLabel>
          <input type="password" value={newAdminPw.pw2} onChange={e=>setNewAdminPw(s=>({...s,pw2:e.target.value}))}
            placeholder="Re-enter password" style={inputStyle}/>
        </div>
        <Btn onClick={changeAdminPw} variant="primary" size="md" style={{ width:'100%' }}>Change Password</Btn>
      </Modal>

      {/* Reset User Password Modal */}
      <Modal open={!!resetPwModal} onClose={()=>setResetPwModal(null)} title="🔑 Reset User Password" width={400}>
        {resetPwModal && (
          <div>
            <div style={{ background:C.off,borderRadius:10,padding:'10px 14px',marginBottom:16,border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12,color:C.muted }}>Resetting password for:</div>
              <div style={{ fontWeight:700,color:C.text,marginTop:3 }}>{resetPwModal.displayName}</div>
              <div style={{ fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono',monospace" }}>{resetPwModal.username}</div>
            </div>
            <div style={{ marginBottom:18 }}>
              <FieldLabel required>New Password</FieldLabel>
              <input type="password" value={newPwForUser} onChange={e=>setNewPwForUser(e.target.value)}
                placeholder="Enter new password" style={inputStyle}/>
            </div>
            <div style={{ background:C.yellowL,borderRadius:8,padding:'9px 13px',marginBottom:16,fontSize:12,color:C.yellow }}>
              ⚠️ User will be prompted to change password on next login.
            </div>
            <Btn onClick={resetUserPw} variant="primary" size="md" style={{ width:'100%' }}>Reset Password</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);
  const handlePwChanged = (u) => setUser(u);

  if (!user) return <LoginPage onLogin={handleLogin}/>;
  if (user.firstLogin) return <ChangePasswordPage user={user} onDone={handlePwChanged} onLogout={handleLogout}/>;
  if (user.role==='admin') return <AdminPortal user={user} onLogout={handleLogout}/>;
  return <UserPortal user={user} onLogout={handleLogout}/>;
}