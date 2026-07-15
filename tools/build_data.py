#!/usr/bin/env python3
"""
Turn tools/manifest.json into data.js material:
  - parse existing ARCHIVE (dedupe + know which artist photos are missing)
  - fetch missing artist photos for existing artists (Deezer)
  - generate JS for new album entries (bios + fictional ratings/reviews)
  - build the ARTIST_IMG map for every artist that has a photo
Outputs tools/new_entries.js, tools/artist_img.js, and a report.
"""
import json, os, re, time, urllib.parse, urllib.request, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG  = os.path.join(ROOT, "images")
UA   = "CHARP-mockup/1.0 (personal prototype)"
DROP = {"Remulak", "Arianne"}

def slug(s): return re.sub(r'[^a-z0-9]', '', s.lower())
def alslug(t):
    t = re.sub(r'[\(\[].*?[\)\]]', '', t)
    return slug(t)[:22] or slug(t)[:22]

def get(url):
    try:
        r = urllib.request.Request(url, headers={"User-Agent": UA})
        return json.load(urllib.request.urlopen(r, timeout=20))
    except Exception:
        return None
def dl(url, path):
    try:
        r = urllib.request.Request(url, headers={"User-Agent": UA})
        d = urllib.request.urlopen(r, timeout=30).read()
        if len(d) < 1500: return False
        open(path, "wb").write(d); return True
    except Exception:
        return False

# ---- 1. parse existing data.js -------------------------------------------
txt  = open(os.path.join(ROOT, "data.js"), encoding="utf-8").read()
arch = txt.split("window.FRIEND_ACTIVITY")[0]
# match both '...' and "..." quoting for artist and album
Q = r"""(?:'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)")"""
pair_re = re.compile(r"artist:" + Q + r"\s*,\s*album:" + Q)
existing_pairs, existing_artists = set(), []
for g in pair_re.findall(arch):
    a = (g[0] or g[1]).replace('\\"','"').replace("\\'", "'")
    b = (g[2] or g[3]).replace('\\"','"').replace("\\'", "'")
    existing_pairs.add((a, slug(b)))
    if a not in existing_artists: existing_artists.append(a)
print(f"existing: {len(existing_pairs)} albums, {len(existing_artists)} artists")

# ---- 2. fetch missing artist photos for existing artists -----------------
missing = [a for a in existing_artists if not os.path.exists(os.path.join(IMG, f"artist-{slug(a)}.jpg"))]
print(f"fetching {len(missing)} missing existing-artist photos...")
for a in missing:
    q = get("https://api.deezer.com/search/artist?limit=1&q=" + urllib.parse.quote(a))
    if q and q.get("data") and q["data"][0].get("picture_xl"):
        ok = dl(q["data"][0]["picture_xl"], os.path.join(IMG, f"artist-{slug(a)}.jpg"))
        print(f"   {'ok ' if ok else '!! '}{a}")
    else:
        print(f"   -- no photo {a}")
    time.sleep(0.2)

# ---- 3. bios + review pool -----------------------------------------------
GEN = {"Rap/Hip Hop":"Hip-hop","Electro":"Electronic","Alternative":"Alternative",
       "Pop":"Pop","Rock":"Rock","Films/Games":"Soundtrack","Classical":"Classical",
       "R&B":"R&B","Folk":"Folk","Dance":"Electronic","":"Alternative"}
BIO = {
 "Trippie Redd":("American rapper and singer","Trippie Redd is an American rapper and singer from Canton, Ohio, known for blending melodic trap with emo and rock."),
 "Justice":("French electronic duo","Justice are a French electronic music duo of Gaspard Augé and Xavier de Rosnay, pillars of the Ed Banger label."),
 "Men I Trust":("Canadian indie band","Men I Trust is a Canadian indie band from Quebec City known for its hazy, minimalist dream-pop."),
 "Leessang":("South Korean hip-hop duo","Leessang were a South Korean hip-hop duo composed of Gary and Gil, celebrated for soulful, lyrical rap."),
 "Freestylers":("British big beat group","Freestylers are a British big beat and breakbeat group formed in London in the mid-1990s."),
 "Cake Pop":("American hyperpop collective","Cake Pop is an American hyperpop supergroup assembled around producer Dylan Brady."),
 "Kanye West":("American rapper and producer","Kanye West is an American rapper, producer, and designer from Chicago, one of the most influential figures in modern music."),
 "100 gecs":("American hyperpop duo","100 gecs is an American hyperpop duo of Dylan Brady and Laura Les, pioneers of the genre's maximalist chaos."),
 "Tim Presley":("American musician","Tim Presley is an American musician known for his garage-psych project White Fence and his collaboration DRINKS."),
 "death's dynamic shroud":("American electronic trio","death's dynamic shroud is an American experimental electronic trio rooted in vaporwave and plunderphonics."),
 "$uicideboy$":("American hip-hop duo","$uicideboy$ are an American hip-hop duo from New Orleans, cousins Ruby da Cherry and $crim, known for dark, lo-fi trap."),
 "Bugseed":("Japanese beatmaker","Bugseed is a Japanese lo-fi hip-hop producer and beatmaker known for warm, sample-driven instrumentals."),
 "CoryaYo":("Hip-hop artist and producer","CoryaYo is a hip-hop artist and producer working in a soulful, beat-driven style."),
 "J.Rawls":("American hip-hop producer","J.Rawls is an American hip-hop producer from Ohio, a co-founder of Lone Catalysts and a fixture of underground soul-rap."),
 "Pigeondust":("Japanese beatmaker","Pigeondust is a Japanese producer known for dusty, boom-bap-tinged lo-fi hip-hop."),
 "Shiro Sagisu":("Japanese composer","Shiro Sagisu is a Japanese composer best known for his scores for Neon Genesis Evangelion and Bleach."),
 "Jan Panenka":("Czech classical pianist","Jan Panenka was a Czech classical pianist (1922-1999) renowned for his interpretations of Beethoven and chamber repertoire."),
 "BAYNK":("New Zealand electronic producer","BAYNK is a New Zealand electronic producer and singer crafting sleek, dance-leaning alt-pop."),
 "Vance Joy":("Australian singer-songwriter","Vance Joy is an Australian singer-songwriter from Melbourne known for warm, folk-pop songwriting."),
 "A. G. Cook":("British producer","A. G. Cook is a British producer and the founder of PC Music, a central architect of hyperpop."),
 "Dutch Disorder":("Electronic producer","Dutch Disorder is an electronic producer working in club-leaning dance styles."),
 "DAVICHI":("South Korean pop duo","Davichi are a South Korean pop duo known for powerhouse ballad vocals."),
 "BläZy":("Electronic artist","BläZy is an electronic artist working across atmospheric, club-adjacent styles."),
 "Frou Frou":("British electronic duo","Frou Frou were a British electronic duo of Imogen Heap and Guy Sigsworth, cult favorites of early-2000s art-pop."),
 "Niki Istrefi":("Electronic producer","Niki Istrefi is an electronic producer and DJ working in hard, percussive club music."),
 "Megumi Hayashibara":("Japanese singer and voice actress","Megumi Hayashibara is a Japanese singer and voice actress, one of the most prolific figures in anime music."),
 "Yoko Takahashi":("Japanese singer","Yoko Takahashi is a Japanese singer best known for 'A Cruel Angel's Thesis,' the theme of Neon Genesis Evangelion."),
 "Florence + The Machine":("English indie rock band","Florence + the Machine are an English indie rock band led by Florence Welch, known for soaring, baroque art-pop."),
 "M.I.A.":("British rapper and singer","M.I.A. is a British rapper, singer, and producer of Sri Lankan Tamil heritage, known for genre-fusing political pop."),
 "Kid Cudi":("American rapper and singer","Kid Cudi is an American rapper and singer from Cleveland whose moody, melodic style reshaped hip-hop."),
 "The Killers":("American rock band","The Killers are an American rock band from Las Vegas, one of the definitive acts of 2000s indie/arena rock."),
 "Syko":("Recording artist","Syko is a recording artist working in a contemporary pop and urban style."),
 "Joey Bada$$":("American rapper","Joey Bada$$ is an American rapper from Brooklyn and a co-founder of the Pro Era collective."),
 "Earl Sweatshirt":("American rapper","Thebe Kgositsile, known as Earl Sweatshirt, is an American rapper from Los Angeles and a former member of Odd Future."),
}
POOL = [
 "one of the most complete projects in their catalog. not a wasted moment",
 "this album lives in my head rent free. the replay value is unreal",
 "textured, patient, and quietly devastating. grows with every listen",
 "the production alone is worth the price of admission",
 "hits a nerve you didn't know you had. stunning front to back",
 "an immaculate run of songs. the sequencing is perfect",
 "took a couple listens to click and then i couldn't stop",
 "this is the one i put on when nothing else feels right",
 "bold, weird, and completely their own thing. love it",
 "the kind of record that makes you text a friend at 2am",
 "gorgeous songwriting, no filler, endlessly rewarding",
 "criminally slept on. deserves way more attention than it got",
 "every element is placed with intention. a real headphone album",
 "warm and immediate but deep enough to sit with for weeks",
 "they never miss and this is proof. instant favorite",
 "emotionally intelligent and sonically fearless",
 "a grower that became an all-timer for me",
 "the atmosphere on this is unmatched. pure mood",
 "confident, cohesive, and impossible to shake",
 "still finding new details months later. what a record",
]
def seed(*xs): return int(hashlib.md5("|".join(map(str,xs)).encode()).hexdigest(),16)

def jstr(s): return "'" + s.replace("\\","\\\\").replace("'","\\'") + "'"

# ---- 4. build new entries -------------------------------------------------
man = json.load(open(os.path.join(ROOT,"tools","manifest.json"), encoding="utf-8"))
entries, artist_img = [], {}
added = skipped = 0
for a in man:
    art = a["artist"]
    if art in DROP: continue
    # artist img map (from downloaded file)
    p = f"images/artist-{slug(art)}.jpg"
    if os.path.exists(os.path.join(ROOT,p)): artist_img[art] = p
    desc, bio = BIO.get(art, (f"{GEN.get('','Alternative')} artist", f"{art} is a recording artist."))
    for al in a["albums"]:
        title = al["album"]
        if (art, slug(title)) in existing_pairs:
            skipped += 1; continue
        existing_pairs.add((art, slug(title)))
        added += 1
        gen = GEN.get(al.get("genre") or "", al.get("genre") or "Alternative")
        try: year = int((al.get("year") or "0")[:4]) or 2020
        except: year = 2020
        tracks = al.get("tracks") or 10
        s = seed(art, title)
        rating = round(3.8 + (s % 11) * 0.1, 1)               # 3.8 - 4.8
        rc = 4000 + (seed(title,"rc") % 86) * 1000            # 4k - 90k
        # 3 reviews, distinct pool lines, ratings near album rating
        idxs = [seed(title,i) % len(POOL) for i in range(6)]
        seen=[];
        for i in idxs:
            if i not in seen: seen.append(i)
            if len(seen)==3: break
        while len(seen)<3: seen.append((seen[-1]+1)%len(POOL))
        revs=[]
        for k,pi in enumerate(seen):
            u = seed(title,"u",k) % 7
            rr = [5,4.5,4][k] if rating>=4.4 else [4.5,4,4][k]
            revs.append(f"        rv({u},{rr},{jstr(POOL[pi])}),")
        entry = (
            "    {\n"
            f"      artist:{jstr(art)}, album:{jstr(title)}, year:{year}, genre:{jstr(gen)}, tracks:{tracks},\n"
            f"      image:{jstr(al['image'])},\n"
            f"      artistDesc:{jstr(desc)},\n"
            f"      artistBio:{jstr(bio)},\n"
            f"      rating:{rating}, reviewCount:{rc},\n"
            "      reviews:[\n" + "\n".join(revs) + "\n      ]\n"
            "    },"
        )
        entries.append(entry)

# also map existing artists that have a photo now (collabs fall back to base artist)
def photo_for(art):
    p = f"images/artist-{slug(art)}.jpg"
    if os.path.exists(os.path.join(ROOT,p)): return p
    base = re.split(r"\s*[&,]\s*| feat", art)[0].strip()   # "X & Y" -> "X"
    if base and base != art:
        bp = f"images/artist-{slug(base)}.jpg"
        if os.path.exists(os.path.join(ROOT,bp)): return bp
    return None
for art in existing_artists:
    p = photo_for(art)
    if p: artist_img.setdefault(art, p)

open(os.path.join(ROOT,"tools","new_entries.js"),"w",encoding="utf-8").write("\n".join(entries)+"\n")
# artist img map JS
lines = ["  window.ARTIST_IMG = {"]
for k in sorted(artist_img): lines.append(f"    {jstr(k)}: {jstr(artist_img[k])},")
lines.append("  };")
open(os.path.join(ROOT,"tools","artist_img.js"),"w",encoding="utf-8").write("\n".join(lines)+"\n")

print(f"\nadded {added} new album entries, skipped {skipped} dupes")
print(f"ARTIST_IMG covers {len(artist_img)} artists")
no_photo=[a for a in existing_artists if a not in artist_img]
if no_photo: print("existing artists still without photo:", no_photo)
