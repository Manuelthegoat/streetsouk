import { C,F,Header } from '@/components/street-souk-ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable,SafeAreaView,StyleSheet,Text,View } from 'react-native';

export default function CartScreen(){const router=useRouter();return <SafeAreaView style={s.safe}><Header title="YOUR CART"/><View style={s.content}><View style={s.icon}><Ionicons name="cart-outline" size={28} color={C.neon}/></View><Text style={s.title}>YOUR BAG IS EMPTY.</Text><Text style={s.copy}>When you find something you like in the StreetSouk store, it’ll show up here.</Text><Pressable style={s.button} onPress={()=>router.replace('/(tabs)/shop')}><Text style={s.buttonText}>EXPLORE THE SHOP</Text><Ionicons name="arrow-forward" size={18} color={C.ink}/></Pressable></View></SafeAreaView>}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},content:{flex:1,justifyContent:'center',padding:25},icon:{width:56,height:56,borderWidth:1,borderColor:C.neon,alignItems:'center',justifyContent:'center'},title:{fontFamily:F.display,color:C.neon,fontSize:31,marginTop:18},copy:{fontFamily:F.body,color:C.muted,fontSize:16,lineHeight:22,marginTop:6},button:{marginTop:22,padding:14,backgroundColor:C.green,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},buttonText:{color:C.ink,fontFamily:F.mono,fontSize:10}});
