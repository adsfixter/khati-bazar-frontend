import Categories from '@/src/components/shared/Categories';
import ShopnowMain from '@/src/components/Shopnow/ShopnowMain';
import React, { Suspense } from 'react';

const Shopnow = () => {
    return (
        <div>
            <Categories></Categories>
            <Suspense fallback={<div className="py-20 text-center font-medium text-[#37651B]">Loading Shop...</div>}>
                <ShopnowMain></ShopnowMain>
            </Suspense>
        </div>
    );
};

export default Shopnow;