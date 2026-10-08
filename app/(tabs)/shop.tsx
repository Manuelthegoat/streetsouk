import { C,F,Header } from '@/components/street-souk-ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,View } from 'react-native';
import { useState } from 'react';

const categories=['Explore','Brands','New Arrivals','Mens','Womens','Footwear','Accessories'] as const;
type ShopCategory=(typeof categories)[number];
const products=[{name:'BOLAPSD. / THE DAILY POLO',brand:'BOLAPSD.',price:'₦ 48,000',image:require('@/assets/brands/bolapsdpolo.png')},{name:'BONFO / CITY TROUSER',brand:'BONFO',price:'₦ 65,000',image:require('@/assets/brands/bonfotrouser.png')}];
const brands=[{name:'BOLAPSD.',type:'FOOTWEAR',image:require('@/assets/brands/bolapsd.png')},{name:'IYOO CARTEL',type:'APPAREL',image:require('@/assets/brands/iyoocartel.png')},{name:'BONFO',type:'ACCESSORIES',image:require('@/assets/brands/bonfo.png')},{name:'THE CHROME PILGRIM',type:'ACCESSORIES',image:require('@/assets/brands/TCP.png')},{name:'GREATERTHAN00',type:'ACCESSORIES',image:require('@/assets/brands/ssx_logo.png')}];

export default function ShopScreen(){
  const router=useRouter();
  const [category,setCategory]=useState<ShopCategory>('Explore');
  const showProducts=category==='Explore'||category==='New Arrivals';
  const visibleBrands=category==='Footwear'?brands.filter(b=>b.type==='FOOTWEAR'):category==='Accessories'?brands.filter(b=>b.type==='ACCESSORIES'):brands;
  const openBrands=()=>router.push('/(tabs)/vendors');
  return <SafeAreaView style={s.safe}>
    <Header title="SHOP"/>
    <ScrollView horizontal style={s.topTabs} contentContainerStyle={s.topTabsContent} showsHorizontalScrollIndicator={false}>
      {categories.map(item=><Pressable key={item} accessibilityRole="tab" accessibilityState={{selected:category===item}} onPress={()=>setCategory(item)} style={[s.topTab,category===item&&s.topTabActive]}><Text style={[s.topTabText,category===item&&s.topTabTextActive]}>{item.toUpperCase()}</Text></Pressable>)}
    </ScrollView>
    <ScrollView contentContainerStyle={s.content}>
      {category==='Explore'&&<>
        <Text style={s.kicker}>INDEPENDENT BY NATURE</Text><Text style={s.title}>THE STORE</Text>
        <Text style={s.copy}>Discover the labels shaping the streets. Shop the latest from the StreetSouk community.</Text>
        <Pressable style={s.banner} onPress={openBrands}><Text style={s.bannerEyebrow}>MEET THE MAKERS</Text><Text style={s.bannerTitle}>SHOP THE{ '\n'}COMMUNITY</Text><Text style={s.bannerLink}>BROWSE BRANDS ↗</Text></Pressable>
      </>}
      {category==='New Arrivals'&&<><Text style={s.kicker}>JUST LANDED</Text><Text style={s.title}>NEW ARRIVALS</Text><Text style={s.copy}>Fresh pieces from StreetSouk community brands.</Text></>}
      {(category==='Mens'||category==='Womens')&&<><Text style={s.kicker}>SHOP THE COMMUNITY</Text><Text style={s.title}>{category.toUpperCase()}</Text><Text style={s.copy}>Explore independent labels and discover their latest pieces.</Text></>}
      {(category==='Brands'||category==='Footwear'||category==='Accessories')&&<><Text style={s.kicker}>INDEPENDENT LABELS</Text><Text style={s.title}>{category.toUpperCase()}</Text><Text style={s.copy}>{category==='Footwear'?'Discover footwear labels from the StreetSouk community.':category==='Accessories'?'Explore accessories and details from independent makers.':'Meet the brands shaping the StreetSouk community.'}</Text></>}
      {showProducts?<><View style={s.head}><Text style={s.section}>{category==='Explore'?'FEATURED DROPS':'LATEST DROPS'}</Text><Text style={s.count}>01 — 02</Text></View><View style={s.grid}>{products.map(p=><Pressable key={p.name} style={s.product} onPress={openBrands}><View style={s.imageWrap}><Image source={p.image} resizeMode="cover" style={s.image}/><View style={s.badge}><Text style={s.badgeText}>STREET SOUK SELECT</Text></View></View><Text style={s.brand}>{p.brand}</Text><Text style={s.name}>{p.name}</Text><Text style={s.price}>{p.price}</Text></Pressable>)}</View></>:<View style={s.brandList}>{visibleBrands.map(brand=><Pressable key={brand.name} style={s.brandRow} onPress={openBrands}><View style={s.brandLogo}><Image source={brand.image} resizeMode="contain" style={s.brandImage}/></View><View style={s.brandInfo}><Text style={s.brandName}>{brand.name}</Text><Text style={s.brandType}>{brand.type}</Text></View><Ionicons name="arrow-forward" size={17} color={C.muted}/></Pressable>)}</View>}
      {(category==='Mens'||category==='Womens')&&<Pressable style={s.directory} onPress={openBrands}><Text style={s.directoryText}>BROWSE ALL BRANDS</Text><Ionicons name="arrow-forward" size={19} color={C.ink}/></Pressable>}
      {category==='Explore'&&<Pressable style={s.directory} onPress={openBrands}><Text style={s.directoryText}>EXPLORE ALL BRANDS</Text><Ionicons name="arrow-forward" size={19} color={C.ink}/></Pressable>}
      {(category==='Brands'||category==='Footwear'||category==='Accessories')&&<Pressable style={s.directory} onPress={openBrands}><Text style={s.directoryText}>OPEN BRAND DIRECTORY</Text><Ionicons name="arrow-forward" size={19} color={C.ink}/></Pressable>}
    </ScrollView>
  </SafeAreaView>
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},topTabs:{height:49,borderBottomWidth:1,borderBottomColor:C.line,flexGrow:0},topTabsContent:{paddingHorizontal:14,alignItems:'stretch',gap:23},topTab:{justifyContent:'center',borderBottomWidth:3,borderBottomColor:'transparent',paddingHorizontal:2},topTabActive:{borderBottomColor:C.paper},topTabText:{color:C.muted,fontFamily:F.display,fontSize:14},topTabTextActive:{color:C.paper},content:{padding:17,paddingBottom:40},kicker:{fontFamily:F.mono,color:C.green,fontSize:9,marginTop:19},title:{fontFamily:F.display,color:C.paper,fontSize:39,marginTop:4},copy:{fontFamily:F.body,color:C.muted,fontSize:16,lineHeight:22,marginTop:5,marginBottom:19},banner:{height:175,backgroundColor:C.panel,borderWidth:1,borderColor:C.line,padding:17,justifyContent:'space-between'},bannerEyebrow:{color:C.green,fontFamily:F.mono,fontSize:9},bannerTitle:{color:C.paper,fontFamily:F.display,fontSize:32,lineHeight:34},bannerLink:{color:C.green,fontFamily:F.mono,fontSize:10},head:{marginTop:27,marginBottom:12,flexDirection:'row',justifyContent:'space-between'},section:{color:C.paper,fontFamily:F.display,fontSize:21},count:{color:C.muted,fontFamily:F.mono,fontSize:9,alignSelf:'center'},grid:{flexDirection:'row',gap:11},product:{flex:1},imageWrap:{height:205,backgroundColor:C.panel,position:'relative'},image:{width:'100%',height:'100%'},badge:{position:'absolute',top:8,left:8,backgroundColor:C.paper,padding:6},badgeText:{color:C.ink,fontFamily:F.mono,fontSize:7},brand:{color:C.green,fontFamily:F.mono,fontSize:9,marginTop:10},name:{color:C.paper,fontFamily:F.display,fontSize:16,marginTop:3},price:{color:C.muted,fontFamily:F.body,fontSize:14,marginTop:3},brandList:{marginTop:6},brandRow:{minHeight:72,borderTopWidth:1,borderTopColor:C.line,flexDirection:'row',alignItems:'center',gap:13},brandLogo:{width:46,height:46,backgroundColor:C.paper,alignItems:'center',justifyContent:'center'},brandImage:{width:38,height:38},brandInfo:{flex:1},brandName:{color:C.paper,fontFamily:F.display,fontSize:17},brandType:{color:C.muted,fontFamily:F.mono,fontSize:8,marginTop:3},directory:{marginTop:25,backgroundColor:C.green,padding:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},directoryText:{color:C.ink,fontFamily:F.mono,fontSize:11}});
