// CHARP Archive — album + artist data for the mockup
// Images from Wikimedia Commons. Ratings & reviews are fictional.
(function () {
  const U = [
    { name:'echoplex',    init:'EP', grad:'linear-gradient(135deg,#1c1c3e,#3b1fa8)' },
    { name:'staticfog',   init:'SF', grad:'linear-gradient(135deg,#164e63,#0284c7)' },
    { name:'velvetblast', init:'VB', grad:'linear-gradient(135deg,#450a0a,#dc2626)' },
    { name:'kira_m',      init:'KM', grad:'linear-gradient(135deg,#3b0764,#9333ea)' },
    { name:'josekm',      init:'JK', grad:'linear-gradient(135deg,#0c4a1e,#16a34a)' },
    { name:'noisegate',   init:'NG', grad:'linear-gradient(135deg,#1c3a5f,#2563eb)' },
    { name:'dustpan',     init:'DP', grad:'linear-gradient(135deg,#2d1b0e,#92400e)' },
  ];
  function rv(u, rating, text) { return { ...U[u], rating, text }; }

  window.ARCHIVE = [
    {
      artist:'My Bloody Valentine', album:'Loveless', year:1991, genre:'Shoegaze', tracks:9,
      image:'images/album-mbv-loveless.png',
      artistDesc:'Irish-English rock band',
      artistBio:'My Bloody Valentine are an Irish-English rock band formed in Dublin in 1983.',
      rating:4.8, reviewCount:89000,
      reviews:[
        rv(0,5,'only shallow is one of the most overwhelming album openers ever made'),
        rv(1,5,'sometimes is the most beautiful thing in human existence, full stop'),
        rv(2,5,'this completely changed what guitar music could sound like. forever'),
      ]
    },
    {
      artist:'Burial', album:'Untrue', year:2007, genre:'UK Garage / Ambient', tracks:11,
      image:'images/album-burial-untrue.jpg',
      artistDesc:'British electronic musician',
      artistBio:'William Bevan, known as Burial, is a British electronic musician from South London.',
      rating:4.9, reviewCount:38000,
      reviews:[
        rv(0,5,'archangel alone is worth a 5/5. the whole thing is haunting'),
        rv(1,5,'this is what 3am sounds like. perfect album'),
        rv(2,5,'the most emotionally devastating electronic album ever made'),
      ]
    },
    {
      artist:'Portishead', album:'Dummy', year:1994, genre:'Trip-hop', tracks:11,
      image:'images/album-portishead-dummy.png',
      artistDesc:'English trip-hop band',
      artistBio:'Portishead are an English electronic band formed in 1991 in Bristol.',
      rating:4.8, reviewCount:65000,
      reviews:[
        rv(0,5,'sour times is the song that made me take music seriously'),
        rv(1,5,"beth gibbons' voice is from another dimension. just stunning"),
        rv(2,4.5,'the template for every trip-hop album that followed'),
      ]
    },
    {
      artist:'Kendrick Lamar', album:'To Pimp a Butterfly', year:2015, genre:'Hip-hop / Jazz', tracks:16,
      image:'images/album-kendrick-tpab.png',
      artistDesc:'American rapper and songwriter',
      artistBio:'Kendrick Lamar Duckworth is an American rapper and songwriter from Compton, California.',
      rating:4.9, reviewCount:156000,
      reviews:[
        rv(0,5,'the greatest album of the decade. maybe the century so far'),
        rv(2,5,'every bar lands different depending on where you are in life'),
        rv(1,5,'mortal man\'s reveal still gives me chills on every listen'),
      ]
    },
    {
      artist:'David Bowie', album:'Blackstar', year:2016, genre:'Art rock / Jazz', tracks:7,
      image:'images/album-bowie-blackstar.png',
      artistDesc:'English musician and actor (1947–2016)',
      artistBio:'David Bowie was an English singer-songwriter and actor, widely considered one of the most influential musicians of the 20th century.',
      rating:4.8, reviewCount:78000,
      reviews:[
        rv(0,5,'he knew. this is a farewell and it\'s devastating and beautiful'),
        rv(1,5,'lazarus still destroys me. what a final statement'),
        rv(4,5,'one of the most meaningful albums of the century'),
      ]
    },
    {
      artist:'Sufjan Stevens', album:'Carrie and Lowell', year:2015, genre:'Folk / Chamber pop', tracks:11,
      image:'images/album-sufjan-carrielowell.jpg',
      artistDesc:'American musician',
      artistBio:'Sufjan Stevens is an American singer-songwriter and musician from Detroit, Michigan.',
      rating:4.8, reviewCount:54000,
      reviews:[
        rv(0,5,'death with dignity makes me cry every single time without exception'),
        rv(1,5,'the most personal and devastating thing he\'s ever made'),
        rv(3,5,'should i stay here or just leave? i think about this line constantly'),
      ]
    },
    {
      artist:'Massive Attack', album:'Mezzanine', year:1998, genre:'Trip-hop', tracks:11,
      image:'images/album-massiveattack-mezzanine.png',
      artistDesc:'English trip hop group',
      artistBio:'Massive Attack are an English trip hop collective formed in 1988 in Bristol, England.',
      rating:4.6, reviewCount:42000,
      reviews:[
        rv(0,5,'angel is one of the greatest songs ever recorded. no notes'),
        rv(1,4.5,'the paranoid tension throughout is incredibly well crafted'),
        rv(2,4.5,'dark, dense, claustrophobic in the best way'),
      ]
    },
    {
      artist:'Freddie Gibbs & Madlib', album:'Piñata', year:2014, genre:'Hip-hop', tracks:17,
      image:'images/album-freddiegibbs-pinata.jpg',
      artistDesc:'American rapper and record producer collaboration',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.8, reviewCount:24000,
      reviews:[
        rv(0,5,'one of the greatest rap albums of the decade, full stop'),
        rv(2,5,"harold's flow on thuggin is just insane"),
        rv(4,4.5,'madlib beats + gibbs rapping = timeless'),
      ]
    },
    {
      artist:'Phoebe Bridgers', album:'Punisher', year:2020, genre:'Indie Folk', tracks:10,
      image:'images/album-phoebebridgers-punisher.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Phoebe Bridgers is an American singer-songwriter and musician from Los Angeles, California.',
      rating:4.7, reviewCount:31000,
      reviews:[
        rv(0,5,'funeral is the most heartbreaking song i\'ve heard in years. she ruins you gently'),
        rv(1,5,'garden song alone deserves a 5/5. the whole album feels like a lucid dream'),
        rv(2,4,'savior complex on repeat for an hour. not sorry about it'),
      ]
    },
    {
      artist:'Weyes Blood', album:'Titanic Rising', year:2019, genre:'Art pop / Folk', tracks:10,
      image:'images/album-weyesblood-titanricrising.jpg',
      artistDesc:'American musician',
      artistBio:'Natalie Laura Mering, known professionally as Weyes Blood, is an American singer-songwriter and musician.',
      rating:4.7, reviewCount:38000,
      reviews:[
        rv(0,5,'movies is already a classic. natalie mering is on another level'),
        rv(5,4.5,'the songwriting here is so complete, so patient, so beautiful'),
        rv(3,5,'i cry every time the chorus of movies comes in. every time'),
      ]
    },
    {
      artist:'Kendrick Lamar', album:'good kid, m.A.A.d city', year:2012, genre:'Hip-hop', tracks:12,
      image:'images/album-kendrick-gkmc.jpg',
      artistDesc:'American rapper and songwriter',
      artistBio:'Kendrick Lamar Duckworth is an American rapper and songwriter from Compton, California.',
      rating:4.7, reviewCount:134000,
      reviews:[
        rv(2,5,'swimming pools is one of the most layered songs ever written'),
        rv(0,5,'the storytelling is unmatched, every track builds the world'),
        rv(4,4.5,'the best rap album to understand kendrick\'s genius'),
      ]
    },
    {
      artist:'Frank Ocean', album:'Blonde', year:2016, genre:'R&B / Alternative', tracks:17,
      image:'images/album-frankocean-blonde.jpeg',
      artistDesc:'American singer',
      artistBio:'Frank Ocean is an American singer, songwriter, and photographer from Long Beach, California.',
      rating:4.7, reviewCount:98000,
      reviews:[
        rv(0,5,'self control is the most perfect song of the 2010s'),
        rv(5,5,'a patient, difficult, devastatingly beautiful album'),
        rv(3,4.5,'took me five listens to understand and then i never wanted to stop'),
      ]
    },
    {
      artist:'Nirvana', album:'In Utero', year:1993, genre:'Alternative rock / Grunge', tracks:13,
      image:'images/album-nirvana-inutero.jpg',
      artistDesc:'American rock band (1987–1994)',
      artistBio:'Nirvana was an American rock band formed in Aberdeen, Washington, in 1987, consisting of Kurt Cobain, Krist Novoselic, and Dave Grohl.',
      rating:4.7, reviewCount:52000,
      reviews:[
        rv(0,5,'heart-shaped box is one of the most perfect songs ever written'),
        rv(5,4.5,'rape me was so misunderstood on release. stunning and complex'),
        rv(1,4.5,'dumb is the saddest track on the album and no one talks about it enough'),
      ]
    },
    {
      artist:'Smashing Pumpkins', album:'Siamese Dream', year:1993, genre:'Alternative rock', tracks:13,
      image:'images/album-smashingpumpkins-siamesedream.jpg',
      artistDesc:'American alternative rock band',
      artistBio:'The Smashing Pumpkins are an American alternative rock band formed in Chicago, Illinois, in 1988.',
      rating:4.7, reviewCount:48000,
      reviews:[
        rv(0,5,'cherub rock is one of the greatest guitar intros in rock history'),
        rv(1,4.5,'today and disarm in the same album is just unfair'),
        rv(2,4.5,'corgan was writing the best songs of his life here'),
      ]
    },
    {
      artist:'Aphex Twin', album:'Selected Ambient Works Vol. II', year:1994, genre:'Ambient / Electronic', tracks:24,
      image:'images/album-aphextwin-saw2.jpg',
      artistDesc:'British electronic musician',
      artistBio:'Richard David James, known by the stage name Aphex Twin, is a British electronic musician.',
      rating:4.7, reviewCount:18000,
      reviews:[
        rv(0,5,'the most peaceful and unsettling thing i\'ve ever heard simultaneously'),
        rv(5,4.5,'ambient masterwork, no easy way into it but worth every listen'),
        rv(3,5,'put this on at 2am and just float away'),
      ]
    },
    {
      artist:'Weyes Blood', album:'And in the Darkness, Hearts Aglow', year:2022, genre:'Art pop / Folk', tracks:13,
      image:'images/album-weyesblood-heartsglow.png',
      artistDesc:'American musician',
      artistBio:'Natalie Laura Mering, known professionally as Weyes Blood, is an American singer-songwriter and musician.',
      rating:4.6, reviewCount:22000,
      reviews:[
        rv(0,5,"it's not just sad, it's apocalyptic in scope. masterwork"),
        rv(1,4.5,'children of the empire is devastating and gorgeous simultaneously'),
        rv(2,4.5,"a grief album for a world that doesn't know it's grieving yet"),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'Some Rap Songs', year:2018, genre:'Experimental hip-hop', tracks:15,
      image:'images/album-earlsweatshirt-somerapsongas.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Neruda Kgositsile, known professionally as Earl Sweatshirt, is an American rapper from Los Angeles.',
      rating:4.6, reviewCount:28000,
      reviews:[
        rv(0,5,'grieving in real time, some of the most raw music i\'ve heard'),
        rv(5,4.5,'21 minutes and it says more than most albums say in an hour'),
        rv(2,4.5,"not for everyone but for those it hits, it hits hard"),
      ]
    },
    {
      artist:'JPEGMAFIA', album:'Veteran', year:2018, genre:'Experimental hip-hop', tracks:15,
      image:'images/album-jpegmafia-veteran.jpg',
      artistDesc:'American rapper and record producer',
      artistBio:'Barrington DeVaughn Hendricks, known as JPEGMAFIA, is an American rapper and record producer from Baltimore.',
      rating:4.6, reviewCount:18000,
      reviews:[
        rv(1,5,'x is gonna give it to ya alone proves he\'s untouchable'),
        rv(2,5,'the anger feels completely justified, production is insane'),
        rv(0,4.5,'changed what i thought rap production could sound like'),
      ]
    },
    {
      artist:'RADWIMPS', album:'Kimi no Na wa Soundtrack', year:2016, genre:'J-pop / Alternative', tracks:12,
      image:'images/album-radwimps-yourname.png',
      artistDesc:'Japanese rock band',
      artistBio:'Radwimps is a Japanese rock band formed in Kanagawa, Japan, in 2001.',
      rating:4.6, reviewCount:28000,
      reviews:[
        rv(3,4.5,'zen zen zense hits every time, doesn\'t matter if you\'ve seen the film'),
        rv(4,5,'nandemonaiya makes me cry even though i don\'t understand every lyric'),
        rv(0,4.5,'the way the music syncs with the film is once-in-a-decade filmmaking'),
      ]
    },
    {
      artist:'Asian Kung-Fu Generation', album:'Sol-fa', year:2004, genre:'J-rock / Alternative', tracks:13,
      image:'images/album-akfg-solfa.jpg',
      artistDesc:'Japanese alternative rock band',
      artistBio:'Asian Kung-Fu Generation is a Japanese alternative rock band formed in Kanagawa, Japan, in 1996.',
      rating:4.6, reviewCount:12000,
      reviews:[
        rv(0,4.5,'haruka kanata will always live in my head. classic opener'),
        rv(3,4.5,'one of the essential japanese rock albums, full stop'),
        rv(1,4.5,'the energy never lets up. perfect album for running'),
      ]
    },
    {
      artist:'Freddie Gibbs & Madlib', album:'Bandana', year:2019, genre:'Hip-hop', tracks:12,
      image:'images/album-freddiemadlib-bandana.jpeg',
      artistDesc:'American rapper and record producer collaboration',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.7, reviewCount:31000,
      reviews:[
        rv(0,4.5,'madlib and freddie are just unbeatable together. every track lands'),
        rv(1,5,'criminal (pun intended) how overlooked this is'),
        rv(2,4.5,'the sequencing is immaculate, listens like a movie'),
      ]
    },
    {
      artist:'Yoko Kanno', album:'Cowboy Bebop Original Soundtrack', year:1998, genre:'Jazz / Electronic / Orchestral', tracks:24,
      image:'images/album-yokokanno-cowboybebop.jpg',
      artistDesc:'Japanese composer',
      artistBio:'Yoko Kanno is a Japanese composer, arranger, and musician, best known for her anime soundtracks.',
      rating:4.9, reviewCount:35000,
      reviews:[
        rv(0,5,'tank! is one of the greatest opening themes ever written. forever'),
        rv(1,5,'the range in this thing is staggering. jazz to ambient to rock'),
        rv(2,4.5,'even if you\'ve never seen bebop this album stands completely alone'),
      ]
    },
    {
      artist:'Tame Impala', album:'Currents', year:2015, genre:'Psychedelic pop', tracks:13,
      image:'images/album-tameimpala-currents.png',
      artistDesc:'Australian psychedelic music project',
      artistBio:'Tame Impala is an Australian psychedelic music project created by musician Kevin Parker.',
      rating:4.4, reviewCount:85000,
      reviews:[
        rv(4,4.5,"'cause i'm a man just dissolves you. the whole album does"),
        rv(1,4.5,'the synth work here is from another era, timeless'),
        rv(6,4,'emotionally intelligent in a way psych rock rarely is'),
      ]
    },
    {
      artist:'Mitski', album:'Puberty 2', year:2016, genre:'Indie rock', tracks:11,
      image:'images/album-mitski-puberty2.jpg',
      artistDesc:'American singer-songwriter',
      artistBio:'Mitski Miyawaki, known mononymously as Mitski, is an American singer-songwriter from Japan.',
      rating:4.5, reviewCount:43000,
      reviews:[
        rv(0,5,'your best american girl is one of the best songs of the decade'),
        rv(1,4.5,'nobody lives in the same emotional frequency as mitski. unreal'),
        rv(3,5,'if i could talk i\'d tell you that i miss you so bad it\'s crazy'),
      ]
    },
    {
      artist:'Phoebe Bridgers', album:'Stranger in the Alps', year:2017, genre:'Indie Folk', tracks:9,
      image:'images/album-phoebebridgers-stranger.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Phoebe Bridgers is an American singer-songwriter and musician from Los Angeles, California.',
      rating:4.5, reviewCount:22000,
      reviews:[
        rv(0,5,'scott street is a perfect song. phoebe was already fully formed here'),
        rv(5,4.5,'funeral was technically on this before punisher. it was already devastating'),
        rv(1,4.5,'motion sickness alone announces a major artist. what a debut'),
      ]
    },
    {
      artist:'JPEGMAFIA', album:'LP!', year:2021, genre:'Experimental hip-hop', tracks:18,
      image:'images/album-jpegmafia-lp.jpg',
      artistDesc:'American rapper and record producer',
      artistBio:'Barrington DeVaughn Hendricks, known as JPEGMAFIA, is an American rapper and record producer from Baltimore.',
      rating:4.5, reviewCount:24000,
      reviews:[
        rv(5,4.5,'the aggression and vulnerability are perfectly balanced here'),
        rv(3,4.5,'bald! alone is worth the price of admission'),
        rv(0,4.5,'every sound choice is a statement. dense but rewarding'),
      ]
    },
    {
      artist:'Tyler, the Creator', album:'IGOR', year:2019, genre:'Neo-soul / Hip-hop', tracks:12,
      image:'images/album-tyler-igor.jpg',
      artistDesc:'American rapper and producer',
      artistBio:'Tyler Gregory Okonma, known professionally as Tyler, the Creator, is an American rapper, record producer, and director.',
      rating:4.5, reviewCount:72000,
      reviews:[
        rv(0,5,'gone gone / thank you is perfect. this whole album is perfect'),
        rv(1,4.5,'the genre-blending here is something else entirely'),
        rv(3,4.5,"a heartbreak album that doesn't feel like a heartbreak album"),
      ]
    },
    {
      artist:'Floating Points', album:'Crush', year:2019, genre:'Electronic', tracks:10,
      image:'images/album-floatingpoints-crush.png',
      artistDesc:'British musician and producer',
      artistBio:'Samuel Shepherd, known as Floating Points, is a British musician, DJ, and producer.',
      rating:4.5, reviewCount:12000,
      reviews:[
        rv(0,4.5,'argente is transcendent. what a debut'),
        rv(1,4.5,'electronic music that genuinely feels alive'),
        rv(6,4,'intricate without being cold, emotional without being saccharine'),
      ]
    },
    {
      artist:'Epik High', album:'Shoebox', year:2014, genre:'Korean hip-hop', tracks:14,
      image:'images/album-epikhigh-shoebox.png',
      artistDesc:'South Korean hip-hop group',
      artistBio:'Epik High is a South Korean hip-hop group consisting of Tablo, Mithra Jin, and DJ Tukutz.',
      rating:4.6, reviewCount:7000,
      reviews:[
        rv(3,4.5,'born hater alone is worth it. but the whole album is excellent'),
        rv(0,5,'tablo\'s storytelling on here is just next level'),
        rv(4,4.5,'one of their most emotionally varied records'),
      ]
    },
    {
      artist:'SZA', album:'Ctrl', year:2017, genre:'R&B / Alt-R&B', tracks:14,
      image:'images/album-sza-ctrl.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Solána Imani Rowe, known professionally as SZA, is an American singer and songwriter from Maplewood, New Jersey.',
      rating:4.4, reviewCount:61000,
      reviews:[
        rv(2,4.5,'drew barrymore is still one of the best album openers in recent memory'),
        rv(0,4.5,'soft and wounded in ways most pop music doesn\'t allow itself to be'),
        rv(3,4,'go gina alone deserves a 10/10'),
      ]
    },
    {
      artist:'Daughters', album:"You Won't Get What You Want", year:2018, genre:'Noise rock / Post-punk', tracks:10,
      image:'images/album-daughters-youwontget.jpg',
      artistDesc:'American rock band',
      artistBio:'Daughters are an American noise rock band formed in Providence, Rhode Island, in 2002.',
      rating:4.7, reviewCount:11000,
      reviews:[
        rv(0,5,'the floorshow is fifteen minutes of controlled chaos and i love every second'),
        rv(1,4.5,'most intense album i\'ve heard in years, not always comfortable'),
        rv(2,5,'alexis marshall sounds like he\'s genuinely losing his mind. perfect'),
      ]
    },
    {
      artist:'Mitski', album:'Be the Cowboy', year:2018, genre:'Indie pop / Art rock', tracks:14,
      image:'images/album-mitski-bethecowboy.jpg',
      artistDesc:'American singer-songwriter',
      artistBio:'Mitski Miyawaki, known mononymously as Mitski, is an American singer-songwriter from Japan.',
      rating:4.4, reviewCount:38000,
      reviews:[
        rv(2,4.5,'nobody but mitski could write a song called geyser and make it devastating'),
        rv(0,4.5,'dancing is the best song of the year it came out. still is'),
        rv(4,4,'more polished than puberty 2 but equally painful'),
      ]
    },
    {
      artist:'Freddie Gibbs', album:'$oul $old $eparately', year:2022, genre:'Hip-hop', tracks:14,
      image:'images/album-freddiegibbs-soulsold.png',
      artistDesc:'American rapper',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.3, reviewCount:12000,
      reviews:[
        rv(4,4,'black illuminati is one of his best hooks ever'),
        rv(5,4,'solid but doesn\'t hit as hard as pinata or bandana'),
        rv(3,4.5,'still miles ahead of most rap albums out there'),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'Doris', year:2013, genre:'Hip-hop', tracks:16,
      image:'images/album-earlsweatshirt-doris.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Neruda Kgositsile, known professionally as Earl Sweatshirt, is an American rapper from Los Angeles.',
      rating:4.4, reviewCount:22000,
      reviews:[
        rv(0,4.5,'hive is still one of the best three-verse compositions in rap'),
        rv(1,4,'quiet genius, understated in a way most rap isn\'t'),
        rv(3,4.5,'the tyler feature is still one of my favorites'),
      ]
    },
    {
      artist:'Tame Impala', album:'Innerspeaker', year:2010, genre:'Psychedelic rock', tracks:10,
      image:'images/album-tameimpala-innerspeaker.png',
      artistDesc:'Australian psychedelic music project',
      artistBio:'Tame Impala is an Australian psychedelic music project created by musician Kevin Parker.',
      rating:4.3, reviewCount:42000,
      reviews:[
        rv(3,4,'feels like sun through your eyes. warm and overwhelming'),
        rv(5,4,'the more mellow cousin of lonerism, still essential'),
        rv(0,4.5,'lucidity is a perfect opener, sets everything up beautifully'),
      ]
    },
    {
      artist:'Skepta', album:'Konnichiwa', year:2016, genre:'Grime', tracks:12,
      image:'images/album-skepta-konnichiwa.jpg',
      artistDesc:'English rapper, producer and DJ',
      artistBio:'Joseph Junior Adenuga, known professionally as Skepta, is an English rapper, record producer, and DJ from Tottenham.',
      rating:4.4, reviewCount:15000,
      reviews:[
        rv(4,4.5,"that's not me is the grime anthem of the decade"),
        rv(3,4,'skepta was just on another level here, effortless'),
        rv(1,4.5,'grime at its purest and most powerful'),
      ]
    },
    {
      artist:'Arca', album:'Xen', year:2014, genre:'Electronic / Experimental', tracks:14,
      image:'images/album-arca-xen.jpg',
      artistDesc:'Venezuelan musician',
      artistBio:'Alejandra Ghersi Rodríguez, known professionally as Arca, is a Venezuelan musician, singer, songwriter, and record producer.',
      rating:4.3, reviewCount:8000,
      reviews:[
        rv(0,4.5,'arca\'s most intimate record, feels like a confession'),
        rv(1,4,'gorgeous and strange, exactly what experimental music should be'),
        rv(3,4,'the kind of record that stays with you for weeks'),
      ]
    },
    {
      artist:'Men I Trust', album:'Untourable Album', year:2020, genre:'Dream pop / Indie', tracks:17,
      image:'images/album-menitrust-untourable.jpeg',
      artistDesc:'Canadian indie band',
      artistBio:'Men I Trust is a Canadian indie band formed in Quebec City in 2014, consisting of Emma Proulx, Jessy Caron, and Dragos Chiriac.',
      rating:4.3, reviewCount:14000,
      reviews:[
        rv(3,4.5,'lauren\'s voice is the warmest sound in existence. this album proves it'),
        rv(6,4,'slow and gorgeous, great late night driving music'),
        rv(4,4,'the production is immaculate — every sound placed perfectly'),
      ]
    },
    {
      artist:'Snail Mail', album:'Lush', year:2018, genre:'Indie rock / Emo', tracks:10,
      image:'images/album-snailmail-lush.jpg',
      artistDesc:'Solo musical project of Lindsey Jordan',
      artistBio:'Snail Mail is the musical project of Lindsey Jordan, an American indie rock singer-songwriter from Baltimore.',
      rating:4.4, reviewCount:28000,
      reviews:[
        rv(0,4.5,'heat wave is the best song about loving someone who doesn\'t love you back'),
        rv(1,4.5,'lindsey jordan was 19 when she made this. terrifying'),
        rv(5,4,'pure and direct in a way emo rarely achieves anymore'),
      ]
    },
    {
      artist:'Epik High', album:'Map the Soul', year:2017, genre:'Korean hip-hop', tracks:10,
      image:'images/album-epikhigh-mapthesoul.jpg',
      artistDesc:'South Korean hip-hop group',
      artistBio:'Epik High is a South Korean hip-hop group consisting of Tablo, Mithra Jin, and DJ Tukutz.',
      rating:4.5, reviewCount:8000,
      reviews:[
        rv(3,4.5,'amor fati is one of tablo\'s best verses. album is immaculate'),
        rv(4,4.5,"they never run out of things to say and ways to say it"),
        rv(6,4,'the most ambitious thing they\'ve done in years'),
      ]
    },
    {
      artist:'Massive Attack', album:'Heligoland', year:2010, genre:'Trip-hop', tracks:10,
      image:'images/album-massiveattack-heligoland.png',
      artistDesc:'English trip hop group',
      artistBio:'Massive Attack are an English trip hop collective formed in 1988 in Bristol, England.',
      rating:4.1, reviewCount:16000,
      reviews:[
        rv(4,4,'not as perfect as mezzanine but still essential'),
        rv(5,4,'atlas air is genuinely stunning'),
        rv(3,3.5,'underrated compared to their earlier work'),
      ]
    },
    {
      artist:'Soccer Mommy', album:'Color Theory', year:2020, genre:'Indie rock / Dream pop', tracks:10,
      image:'images/album-soccermommy-colortheory.png',
      artistDesc:'American musician',
      artistBio:'Soccer Mommy is the solo project of Sophie Allison, an American singer-songwriter from Nashville, Tennessee.',
      rating:4.3, reviewCount:18000,
      reviews:[
        rv(3,4,'lucy alone is worth the price of admission'),
        rv(6,4,'earnest and unflinching, like a really honest diary entry'),
        rv(4,4,'still find new things to love on every listen'),
      ]
    },
    {
      artist:'SZA', album:'SOS', year:2022, genre:'R&B / Pop', tracks:23,
      image:'images/album-sza-sos.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Solána Imani Rowe, known professionally as SZA, is an American singer and songwriter from Maplewood, New Jersey.',
      rating:4.1, reviewCount:52000,
      reviews:[
        rv(5,4,'kill bill is an instant classic but the album sags in the middle'),
        rv(4,3.5,'she expanded her range significantly but lost some intimacy'),
        rv(0,4,'snooze is just stunning, wish the whole album hit this hard'),
      ]
    },
    {
      artist:'James Blake', album:'James Blake', year:2011, genre:'Electronic soul / Post-dubstep', tracks:10,
      image:'images/album-jamesblake-selftitled.jpg',
      artistDesc:'English singer-songwriter',
      artistBio:'James Blake Litherland is an English singer, songwriter, and producer from London.',
      rating:4.4, reviewCount:28000,
      reviews:[
        rv(0,4.5,'the wilhelm scream is still the most haunting piece of music he\'s made'),
        rv(5,4,'the space between notes in this is as important as the notes themselves'),
        rv(2,4.5,'limit to your love ruined me. just absolutely destroyed me'),
      ]
    },
    {
      artist:'Mount Kimbie', album:'Cold Spring Fault Less Youth', year:2013, genre:'Electronic / Post-dubstep', tracks:10,
      image:'images/album-mountkimbie-coldspring.png',
      artistDesc:'English electronic music group',
      artistBio:'Mount Kimbie are an English electronic music duo formed in London in 2008.',
      rating:4.3, reviewCount:8000,
      reviews:[
        rv(5,4.5,'hang is one of the most beautiful songs of the decade'),
        rv(4,4,'post-dubstep that aged incredibly well'),
        rv(6,4,'cold and precise but surprisingly emotional'),
      ]
    },
    {
      artist:'Arca', album:'Mutant', year:2015, genre:'Electronic / Experimental', tracks:15,
      image:'images/album-arca-mutant.jpg',
      artistDesc:'Venezuelan musician',
      artistBio:'Alejandra Ghersi Rodríguez, known professionally as Arca, is a Venezuelan musician, singer, songwriter, and record producer.',
      rating:4.2, reviewCount:6000,
      reviews:[
        rv(3,4,'unsettling and gorgeous in equal measure'),
        rv(5,4,'genuinely alien music, there\'s nothing else like it'),
        rv(2,4,'not for the faint of heart but deeply rewarding'),
      ]
    },
    {
      artist:'James Blake', album:'Assume Form', year:2019, genre:'Electronic soul / R&B', tracks:11,
      image:'images/album-jamesblake-assumeform.jpg',
      artistDesc:'English singer-songwriter',
      artistBio:'James Blake Litherland is an English singer, songwriter, and producer from London.',
      rating:4.2, reviewCount:19000,
      reviews:[
        rv(4,4,'mile high is beautiful even if it\'s a bit more mainstream than his peak'),
        rv(6,3.5,'he found happiness and it shows, not always his best mode'),
        rv(3,4,'can\'t believe he got travis scott to do something genuinely moving'),
      ]
    },
    {
      artist:'Epik High', album:'Epik High Is Here', year:2021, genre:'Korean hip-hop', tracks:13,
      image:'images/album-epikhigh-ishere.jpeg',
      artistDesc:'South Korean hip-hop group',
      artistBio:'Epik High is a South Korean hip-hop group consisting of Tablo, Mithra Jin, and DJ Tukutz.',
      rating:4.4, reviewCount:9000,
      reviews:[
        rv(3,4.5,'rosario goes impossibly hard. the album is a statement'),
        rv(4,4,'they come back stronger every time'),
        rv(6,4,'the lyrics hit different if you understand korean culture'),
      ]
    },
    {
      artist:'Asian Kung-Fu Generation', album:'Hometown', year:2018, genre:'J-rock / Alternative', tracks:12,
      image:'images/album-akfg-hometown.jpg',
      artistDesc:'Japanese alternative rock band',
      artistBio:'Asian Kung-Fu Generation is a Japanese alternative rock band formed in Kanagawa, Japan, in 1996.',
      rating:4.3, reviewCount:7000,
      reviews:[
        rv(4,4,'more subdued than their early work but mature and considered'),
        rv(3,4,'yoru no mukou is quiet and beautiful, different from the old stuff'),
        rv(6,3.5,'longtime fans might be thrown but it\'s grown on me'),
      ]
    },
    {
      artist:'Rezz', album:'Mass Manipulation', year:2018, genre:'Techno / Electronic', tracks:9,
      image:'images/album-rezz-massmanipulation.jpg',
      artistDesc:'Ukrainian DJ and record producer',
      artistBio:'Isabelle Rezazadeh, known as Rezz, is a Ukrainian-Canadian DJ and record producer from Niagara Falls, Ontario.',
      rating:4.1, reviewCount:14000,
      reviews:[
        rv(5,4,'puts you in a trance immediately. perfect headphone album'),
        rv(3,4,'dark and hypnotic, she is genuinely unmatched in this space'),
        rv(6,3.5,"not always what i'm in the mood for but when i am it GOES"),
      ]
    },
    {
      artist:'Freddie Gibbs & The Alchemist', album:'Alfredo', year:2020, genre:'Hip-hop', tracks:10,
      image:'images/album-freddiegibbs-alfredo.jpg',
      artistDesc:'American rapper and record producer collaboration',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.5, reviewCount:18000,
      reviews:[
        rv(0,4.5,'the alchemist brings out a different side of freddie'),
        rv(1,4.5,'skinny suge is a perfect song'),
        rv(6,4,'surprisingly mellow for gibbs, works beautifully'),
      ]
    },
    {
      artist:'100 gecs', album:'10000 gecs', year:2023, genre:'Hyperpop / Pop-punk', tracks:13,
      image:'images/album-100gecs-10000gecs.jpg',
      artistDesc:'American musical duo',
      artistBio:'100 Gecs is an American musical duo formed in 2015 that consists of Dylan Brady and Laura Les.',
      rating:3.8, reviewCount:28000,
      reviews:[
        rv(4,3.5,'lost a lot of the chaos that made the first one special'),
        rv(5,3.5,'good but not as revolutionary as the debut'),
        rv(3,4,'the collab tracks still bang though'),
      ]
    },
    {
      artist:'100 gecs', album:'1000 gecs', year:2019, genre:'Hyperpop', tracks:10,
      image:'images/album-100gecs-1000gecs.jpg',
      artistDesc:'American musical duo',
      artistBio:'100 Gecs is an American musical duo formed in 2015 that consists of Dylan Brady and Laura Les.',
      rating:4.1, reviewCount:45200,
      reviews:[
        rv(0,4,'this rewired my brain. nothing sounds like this and probably nothing ever will'),
        rv(1,4.5,'chaotic in the best way, every track is an event unto itself'),
        rv(2,4,'honestly i hated it then loved it then hated it. still love it'),
      ]
    },
    {
      artist:'Crystal Castles', album:'(II)', year:2010, genre:'Electronic / Industrial', tracks:14,
      image:'images/album-crystalcastles1.png',
      artistDesc:'Canadian electronic music group',
      artistBio:'Crystal Castles are a Canadian electronic music group formed in Toronto in 2004.',
      rating:4.4, reviewCount:19000,
      reviews:[
        rv(0,4.5,'celestica is one of the most beautiful songs in electronic music'),
        rv(1,4.5,'alice glass just sounds like no one else, this album is proof'),
        rv(2,4,'chaotic and beautiful in equal measure'),
      ]
    },
  ];

  // Set initial active album and featured albums for home screen
  window.activeAlbum = window.ARCHIVE[0];

  // Pick today's featured album (rotates daily)
  const dayOff = Math.floor(Date.now() / 86400000) % window.ARCHIVE.length;
  window.featuredAlbum = window.ARCHIVE[dayOff];
  window.trendingAlbums = window.ARCHIVE
    .filter((_, i) => i !== dayOff)
    .slice(0, 5);

  window.openAlbum = function (album) {
    window.activeAlbum = album;
    if (typeof navigate === 'function') navigate('album');
  };

  window.fmtRc = function (n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);
  };
})();
