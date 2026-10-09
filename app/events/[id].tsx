import { C,F } from '@/components/street-souk-ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,View } from 'react-native';
import { useStreetSoukStore } from '@/context/street-souk-store';

const tabs=['Event Map','Schedule','Marketplace','Lineup','FAQ'] as const;
type EventTab=(typeof tabs)[number];

export default function EventDetailScreen(){
  const router=useRouter();
  const [activeTab,setActiveTab]=useState<EventTab>('Event Map');
  return <SafeAreaView style={s.safe}>
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to events" onPress={()=>router.back()} style={s.headerAction}><Ionicons name="arrow-back" size={23} color={C.paper}/></Pressable>
      <Image accessibilityLabel="Street Souk" source={require('@/assets/images/sslogo.png')} contentFit="contain" style={s.logo}/>
      <Pressable accessibilityRole="button" accessibilityLabel="Open cart" onPress={()=>router.push('/cart')} style={[s.headerAction,s.cart]}><Ionicons name="cart-outline" size={23} color={C.paper}/></Pressable>
    </View>
    <ScrollView horizontal style={s.tabs} contentContainerStyle={s.tabsContent} showsHorizontalScrollIndicator={false}>
      {tabs.map(tab=><Pressable key={tab} accessibilityRole="tab" accessibilityState={{selected:activeTab===tab}} onPress={()=>setActiveTab(tab)} style={[s.tab,activeTab===tab&&s.tabActive]}><Text style={[s.tabText,activeTab===tab&&s.tabTextActive]}>{tab.toUpperCase()}</Text></Pressable>)}
    </ScrollView>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {activeTab!=='Marketplace'&&<><Text style={s.eventName}>STREET SOUK CONVENTION</Text><Text style={s.eventMeta}>LAGOS, NIGERIA  /  DATE TBA</Text><View style={s.rule}/></>}
      {activeTab==='Event Map'&&<Feature icon="map-outline" eyebrow="PLAN YOUR VISIT" title="EVENT MAP" body="Explore the Convention floor plan and find your way around." action="OPEN EVENT MAP" onPress={()=>router.push('/map')}/>}
      {activeTab==='Schedule'&&<ScheduleContent/>}
      {activeTab==='Marketplace'&&<MarketplaceContent/>}
      {activeTab==='Lineup'&&<View style={s.coming}><Ionicons name="musical-notes-outline" size={27} color={C.neon}/><Text style={s.comingTitle}>LINEUP COMING SOON</Text><Text style={s.body}>We’ll share performers, sets and appearances here as they’re announced.</Text></View>}
      {activeTab==='FAQ'&&<Faq/>}
    </ScrollView>
  </SafeAreaView>
}

function Feature({icon,eyebrow,title,body,action,onPress}:{icon:keyof typeof Ionicons.glyphMap;eyebrow:string;title:string;body:string;action:string;onPress:()=>void}){return <View style={s.feature}><View style={s.featureIcon}><Ionicons name={icon} size={25} color={C.neon}/></View><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.featureTitle}>{title}</Text><Text style={s.body}>{body}</Text><Pressable style={s.button} onPress={onPress}><Text style={s.buttonText}>{action}</Text><Ionicons name="arrow-forward" size={18} color={C.ink}/></Pressable></View>}

const scheduleItems=[
  {time:'2:00 PM – 3:30 PM',title:'EARLY ACCESS DROP',place:'HYPE TENT B',image:require('@/assets/brands/iyoocampaign.jpg')},
  {time:'4:00 PM – 5:00 PM',title:'ZAYLEVELTEN PERFORMANCE',place:'MAIN STAGE',image:require('@/assets/brands/bolacampaign.jpg')},
  {time:'5:30 PM – 7:00 PM',title:'DJ SET: SMADA',place:'SOUND ARENA',image:require('@/assets/brands/bonfocampaign.jpg')},
];

function ScheduleContent(){
  const [filter,setFilter]=useState('ALL');
  const {toggleSavedEvent,isEventSaved}=useStreetSoukStore();
  const filtered=scheduleItems.filter((item)=>filter==='ALL'||(filter==='DROP'?item.title.includes('DROP'):filter==='STAGE'?item.title.includes('PERFORMANCE'):item.title.includes('DJ')));
  return <View>
    <Text style={s.sectionEyebrow}>TIMES SHOWN IN LOCAL TIME</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scheduleFilters}>{['ALL','DROP','STAGE','DJ'].map(item=><Pressable key={item} onPress={()=>setFilter(item)} style={[s.scheduleFilter,filter===item&&s.scheduleFilterActive]}><Text style={[s.scheduleFilterText,filter===item&&s.scheduleFilterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={s.scheduleDay}><Text style={s.scheduleDayTitle}>DAY 1</Text><Text style={s.scheduleDayDate}>SATURDAY 24TH</Text></View>
    {filtered.map(item=><View key={item.title} style={s.scheduleItem}><Text style={s.scheduleTime}>{item.time}</Text><View style={s.scheduleCard}><Image source={item.image} style={s.scheduleImage} contentFit="cover"/><View style={s.scheduleCopy}><Text style={s.scheduleTitle}>{item.title}</Text><View style={s.scheduleLocation}><Ionicons name="location-outline" size={13} color={C.neon}/><Text numberOfLines={1} style={s.schedulePlace}>{item.place}</Text></View></View><Pressable accessibilityRole="button" accessibilityLabel={`${isEventSaved(item.title)?'Unsave':'Save'} ${item.title}`} accessibilityState={{selected:isEventSaved(item.title)}} onPress={()=>toggleSavedEvent(item.title)} style={s.scheduleStar}><Ionicons name={isEventSaved(item.title)?'star':'star-outline'} size={21} color={isEventSaved(item.title)?C.neon:C.paper}/></Pressable></View></View>)}
  </View>
}

const marketplaceBrands=[
  {name:'BOLAPSD.',type:'FOOTWEAR',location:'BOOTH B-12',description:'Exclusive drops, rare deadstock, and custom streetwear polo.',image:require('@/assets/brands/bolacampaign.jpg')},
  {name:'IYOO CARTEL',type:'APPAREL',location:'BOOTH A-04',description:'Members only streetwear and accessories from the IYOO CARTEL collective.',image:require('@/assets/brands/iyoocampaign.jpg')},
  {name:'BONFO',type:'ACCESSORIES',location:'BOOTH C-22',description:'Neo-African fashion.',image:require('@/assets/brands/bonfocampaign.jpg')},
  {name:'THE CHROME PILGRIM',type:'ACCESSORIES',location:'BOOTH C-22',description:'Chains, pendants, and grills. Heavy metals only.',image:require('@/assets/brands/tcpcampaign.png')},
  {name:'GREATERTHAN00',type:'ACCESSORIES',location:'BOOTH C-22',description:'Chains, pendants, and grills. Heavy metals only.',image:require('@/assets/brands/iyoocampaign.jpg')},
];

function MarketplaceContent(){
  const router=useRouter();
  const {favorites,toggleFavorite,isFavorite}=useStreetSoukStore();
  const [filter,setFilter]=useState<'ALL'|'FAVORITES'|'SPONSORS'>('ALL');
  const [query,setQuery]=useState('');
  const filtered=marketplaceBrands.filter(brand=>{
    const matchesFilter=filter==='ALL'||(filter==='FAVORITES'?isFavorite(brand.name):false);
    const matchesSearch=`${brand.name} ${brand.type} ${brand.location} ${brand.description}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter&&matchesSearch;
  });
  return <View style={s.marketplace}>
    <View style={s.filterRow}><View style={s.filterSpacer}/>{(['ALL','FAVORITES','SPONSORS'] as const).map(item=><Pressable key={item} accessibilityRole="tab" accessibilityState={{selected:filter===item}} onPress={()=>setFilter(item)} style={[s.marketFilter,filter===item&&s.marketFilterActive]}><Text style={[s.marketFilterText,filter===item&&s.marketFilterTextActive]}>{item}</Text></Pressable>)}</View>
    <View style={s.marketSearch}><Ionicons name="search" size={19} color={C.muted}/><TextInput accessibilityLabel="Search for vendors and brands" value={query} onChangeText={setQuery} placeholder="Search for vendors & brands" placeholderTextColor={C.muted} style={s.marketSearchInput}/>{query.length>0&&<Pressable accessibilityLabel="Clear search" onPress={()=>setQuery('')}><Ionicons name="close-circle" size={18} color={C.muted}/></Pressable>}</View>
    <View style={s.marketList}>{filtered.map(brand=><View key={brand.name} style={s.brandCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${brand.name}`} onPress={()=>router.push({pathname:'/vendor/[name]',params:{name:brand.name}})} style={s.brandCardMain}>
        <Image source={brand.image} contentFit="cover" style={s.brandCardImage}/>
        <View style={s.brandCardCopy}><Text numberOfLines={1} style={s.brandCardName}>{brand.name}</Text><View style={s.brandLocation}><Ionicons name="location-outline" size={12} color={C.neon}/><Text style={s.brandLocationText}>{brand.location}</Text></View><Text numberOfLines={2} style={s.brandDescription}>{brand.description}</Text></View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${isFavorite(brand.name)?'Remove':'Add'} ${brand.name} ${isFavorite(brand.name)?'from':'to'} favorites`} accessibilityState={{selected:isFavorite(brand.name)}} onPress={()=>toggleFavorite(brand.name)} style={s.brandStar}><Ionicons name={isFavorite(brand.name)?'star':'star-outline'} size={21} color={isFavorite(brand.name)?C.neon:C.paper}/></Pressable>
    </View>)}{filtered.length===0&&<View style={s.empty}><Ionicons name={filter==='SPONSORS'?'ribbon-outline':'search-outline'} size={23} color={C.muted}/><Text style={s.emptyText}>{filter==='SPONSORS'?'SPONSOR BRANDS WILL BE LISTED HERE.':'NO BRANDS MATCH YOUR SEARCH.'}</Text></View>}</View>
  </View>
}

function Faq(){const [open,setOpen]=useState<number|null>(0);const questions=[['When is the Convention?','The event date will be announced soon.'],['Where will it take place?','Street Souk Convention will take place in Lagos, Nigeria. Venue details are coming soon.'],['Where can I get tickets?','Ticket information will be shared here when it is available.'],['How does the SS Passport work?','Collect a stamp at participating brand booths during the Convention. More details will be announced closer to the event.']];return <View><Text style={s.faqTitle}>FREQUENTLY ASKED QUESTIONS</Text>{questions.map(([question,answer],index)=><Pressable key={question} onPress={()=>setOpen(open===index?null:index)} style={s.faqRow}><View style={s.faqQuestion}><Text style={s.question}>{question}</Text><Ionicons name={open===index?'remove':'add'} size={20} color={C.neon}/></View>{open===index&&<Text style={s.answer}>{answer}</Text>}</Pressable>)}</View>}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},header:{height:58,paddingHorizontal:15,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerAction:{width:45,height:42,justifyContent:'center'},cart:{alignItems:'flex-end'},logo:{width:92,height:38},tabs:{height:49,borderBottomWidth:1,borderBottomColor:C.line,flexGrow:0},tabsContent:{paddingHorizontal:14,gap:23,alignItems:'stretch'},tab:{justifyContent:'center',borderBottomWidth:3,borderBottomColor:'transparent',paddingHorizontal:2},tabActive:{borderBottomColor:C.neon},tabText:{color:C.muted,fontFamily:F.display,fontSize:13},tabTextActive:{color:C.neon},content:{padding:18,paddingBottom:40},eventName:{color:C.neon,fontFamily:F.display,fontSize:26,marginTop:9},eventMeta:{color:C.neon,fontFamily:F.mono,fontSize:9,marginTop:5},rule:{height:1,backgroundColor:C.line,marginTop:17,marginBottom:21},feature:{minHeight:280,justifyContent:'center',padding:19,backgroundColor:C.panel,borderWidth:1,borderColor:C.line},featureIcon:{width:49,height:49,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center',marginBottom:18},eyebrow:{color:C.neon,fontFamily:F.mono,fontSize:9},featureTitle:{color:C.neon,fontFamily:F.display,fontSize:29,marginTop:6},body:{color:C.muted,fontFamily:F.body,fontSize:16,lineHeight:22,marginTop:6},button:{marginTop:22,backgroundColor:C.green,padding:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},buttonText:{color:C.ink,fontFamily:F.mono,fontSize:10},sectionEyebrow:{color:C.muted,fontFamily:F.mono,fontSize:9},scheduleFilters:{gap:8,paddingVertical:15},scheduleFilter:{borderWidth:1,borderColor:C.line,paddingHorizontal:12,paddingVertical:8},scheduleFilterActive:{backgroundColor:C.neon,borderColor:C.neon},scheduleFilterText:{color:C.paper,fontFamily:F.mono,fontSize:9},scheduleFilterTextActive:{color:C.ink},scheduleDay:{minHeight:43,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:C.line,marginBottom:15},scheduleDayTitle:{color:C.neon,fontFamily:F.display,fontSize:21},scheduleDayDate:{color:C.muted,fontFamily:F.mono,fontSize:8},scheduleItem:{marginBottom:16},scheduleTime:{color:C.neon,fontFamily:F.mono,fontSize:11,marginBottom:7,marginLeft:2},scheduleCard:{minHeight:88,padding:8,borderWidth:1,borderColor:C.line,backgroundColor:C.panel,flexDirection:'row',alignItems:'center',gap:10},scheduleImage:{width:68,height:68,backgroundColor:C.bg},scheduleCopy:{flex:1,justifyContent:'center'},scheduleTitle:{color:C.neon,fontFamily:F.display,fontSize:14,lineHeight:17},scheduleLocation:{flexDirection:'row',alignItems:'center',gap:4,marginTop:7},schedulePlace:{color:C.muted,fontFamily:F.mono,fontSize:8,flexShrink:1},scheduleStar:{width:32,height:42,alignItems:'center',justifyContent:'center'},marketplace:{gap:13},filterRow:{flexDirection:'row',justifyContent:'flex-end',gap:6},filterSpacer:{flex:1},marketFilter:{borderWidth:1,borderColor:C.line,paddingVertical:8,paddingHorizontal:10},marketFilterActive:{backgroundColor:C.neon,borderColor:C.neon},marketFilterText:{color:C.paper,fontFamily:F.mono,fontSize:8},marketFilterTextActive:{color:C.ink},marketSearch:{height:46,borderWidth:1,borderColor:C.line,backgroundColor:C.panel,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:9},marketSearchInput:{flex:1,color:C.paper,fontFamily:F.body,fontSize:15,paddingVertical:0},marketList:{gap:10},brandCard:{minHeight:105,padding:9,borderWidth:1,borderColor:C.line,backgroundColor:C.panel,flexDirection:'row',alignItems:'center',gap:8},brandCardMain:{flex:1,flexDirection:'row',alignItems:'center',gap:11},brandCardImage:{width:78,height:84,backgroundColor:C.bg},brandCardCopy:{flex:1,justifyContent:'center'},brandCardName:{color:C.neon,fontFamily:F.display,fontSize:15},brandLocation:{flexDirection:'row',alignItems:'center',gap:4,marginTop:4},brandLocationText:{color:C.neon,fontFamily:F.mono,fontSize:8},brandDescription:{color:C.muted,fontFamily:F.body,fontSize:13,lineHeight:16,marginTop:4},brandStar:{width:34,height:52,alignItems:'center',justifyContent:'center'},empty:{minHeight:150,alignItems:'center',justifyContent:'center',gap:12,borderWidth:1,borderColor:C.line,backgroundColor:C.panel},emptyText:{color:C.muted,fontFamily:F.mono,fontSize:9,textAlign:'center'},coming:{minHeight:245,justifyContent:'center',alignItems:'flex-start',padding:20,backgroundColor:C.panel,borderWidth:1,borderColor:C.line},comingTitle:{color:C.neon,fontFamily:F.display,fontSize:24,marginTop:14},faqTitle:{color:C.neon,fontFamily:F.display,fontSize:20,marginBottom:10},faqRow:{borderTopWidth:1,borderTopColor:C.line,paddingVertical:16},faqQuestion:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:15},question:{color:C.neon,fontFamily:F.display,fontSize:17,flex:1},answer:{color:C.muted,fontFamily:F.body,fontSize:15,lineHeight:21,marginTop:11}});
