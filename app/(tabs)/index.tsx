import BigSaleBannerr from '@/components/home/banner'
import Category from '@/components/home/Category'
import FlashSaleSection from '@/components/home/FlashSaleSection'
import Header from '@/components/home/header'
import SubHeader from '@/components/home/SubHeader'
import Vendors from '@/components/home/vendors'
import React from 'react'
import { ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function index() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar barStyle={"dark-content"} backgroundColor={"#fff"}/>
      <Header />
      <SubHeader/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BigSaleBannerr/>
        <Category></Category>
        <FlashSaleSection></FlashSaleSection>
        <Vendors></Vendors>
      </ScrollView>
    </SafeAreaView>
  )
}