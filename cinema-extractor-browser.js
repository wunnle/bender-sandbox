/* Biletinial cinema inventory probe. Run on a biletinial.com page in a browser:
   await window.extractPreferredCinema({start:'2026-11-02', end:'2026-11-21'})
   Read-only; outputs evidence candidates, never writes event data. */
window.extractPreferredCinema = async function ({start, end} = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}-\d{2}$/.test(end || '') || start > end) throw Error('Provide ISO start/end');
  const base = 'https://biletinial.com';
  if (location.origin !== base) throw Error('Run on https://biletinial.com');
  const venues = [
    ['Kadıköy Sineması','/tr-tr/mekan/kadikoy-sinemasi'],
    ['Caddebostan CKM Sineması','/tr-tr/mekan/caddebostan-ckm-sinemasi'],
    ['İstanbul Yelken Kulübü Açık Hava Sineması','/tr-tr/mekan/istanbul-yelken-kulubu-acik-hava-sinemasi']
  ];
  const parse = html => new DOMParser().parseFromString(html, 'text/html');
  // The session route is AJAX-only: a normal fetch can return a cached 404.
  const read = async (url, ajax = false) => { const r = await fetch(url, {credentials:'same-origin', headers: ajax ? {'X-Requested-With':'XMLHttpRequest'} : {}}); if (!r.ok) throw Error(`HTTP ${r.status}: ${url}`); return r.text(); };
  const clean = s => (s || '').replace(/\s+/g,' ').trim();
  const result = {start,end,venues:[],sessions:[],errors:[],limitations:['Screening evidence only; ticket price and purchase availability are not independently verified.','Non-cinema event-style screenings require a separate extractor.']};
  for (const [name,path] of venues) {
    const report = {venue:name,url:base+path,films:0,dateRequests:0,sessionRequests:0,sessions:0,nonCinemaLinks:[],emptyProgramme:false}; result.venues.push(report);
    try {
      const venueDoc = parse(await read(path));
      report.emptyProgramme = venueDoc.body.textContent.includes('Seçilen kriterlere uygun etkinlik bulunamadı.');
      const films = new Map();
      for (const a of venueDoc.querySelectorAll('a[href]')) {
        const u = new URL(a.getAttribute('href'),base);
        if (u.origin !== base) continue;
        if (u.pathname.includes('/sinema/') && u.searchParams.get('cinemaBranchId')) films.set(u.href,clean(a.textContent) || films.get(u.href) || '');
        else if (/\/etkinlik\//.test(u.pathname) && clean(a.textContent)) report.nonCinemaLinks.push({title:clean(a.textContent),url:u.href});
      }
      report.nonCinemaLinks = Array.from(new Map(report.nonCinemaLinks.map(x=>[x.url,x])).values());
      report.films = films.size;
      if (!films.size && !report.emptyProgramme) result.errors.push({venue:name,error:'No film links and no explicit empty-programme message; inspect source.'});
      for (const [url,title] of films) {
        try {
          const filmHTML = await read(url), branch = new URL(url).searchParams.get('cinemaBranchId');
          const find = key => { const m = filmHTML.match(new RegExp('(?:var|let|const)\\s+'+key+'\\s*=\\s*[\\\"\\\']?([\\w-]+)')); return m && m[1]; };
          const id=find('eventId'), lang=find('langId'), country=find('countryCode');
          if (!id || !lang || !country) throw Error('Missing film eventId/langId/countryCode');
          const datesURL=`/details/GetDateListForCity?eventId=${id}&langId=${lang}&cityId=77&cinemaBranchId=${branch}`;
          report.dateRequests++;
          const datesDoc=parse(await read(datesURL));
          const dates=Array.from(new Set(Array.from(datesDoc.querySelectorAll('#yn_dateList a[data-date]'),x=>x.getAttribute('data-date')))).filter(x=>x>=start&&x<=end);
          for (const day of dates) {
            try {
            const sessionURL=`/dynamic/get_seances/${id}/77/${day}/${lang}/${country}?cinemaBranchId=${branch}`;
            report.sessionRequests++;
            const sessionDoc=parse(await read(sessionURL, true));
            for (const cinema of sessionDoc.querySelectorAll('.yn_cinema')) {
              const venueLink=cinema.querySelector('.yn_cinema_info_title a');
              if (!venueLink || new URL(venueLink.getAttribute('href'),base).pathname !== path) { result.errors.push({venue:name,title,day,error:'Unexpected venue in session response'}); continue; }
              for (const hall of cinema.querySelectorAll('.yn_cinema_salon_info')) {
                const hallName=clean(hall.querySelector('h2')?.textContent), format=clean(hall.querySelector('span')?.textContent);
                for (const button of hall.querySelectorAll('button[data-title]')) {
                  const time=clean(button.textContent), sessionId=button.getAttribute('data-title');
                  if (!/^\d{1,2}:\d{2}$/.test(time) || !/^\d+$/.test(sessionId)) { result.errors.push({venue:name,title,day,error:'Unrecognized session button'}); continue; }
                  const disabled=button.disabled || button.hasAttribute('disabled') || /sold|disabled|passive|tukendi/i.test(button.className+' '+button.getAttribute('title'));
                  result.sessions.push({day,time,title,venue:name,hall:hallName,format,sessionId,url,sessionEvidence:base+sessionURL,availability:disabled?'unavailable':'unverified'}); report.sessions++;
                }
              }
            }
            } catch (e) { result.errors.push({venue:name,title,day,url,error:String(e)}); }
          }
        } catch (e) { result.errors.push({venue:name,title,url,error:String(e)}); }
      }
    } catch (e) { result.errors.push({venue:name,error:String(e)}); }
  }
  result.sessions.sort((a,b)=>a.day.localeCompare(b.day)||a.time.localeCompare(b.time)||a.title.localeCompare(b.title));
  return result;
};