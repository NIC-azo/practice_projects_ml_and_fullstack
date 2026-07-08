import { request } from "@/api/request.config";
import type {ProductsResponseData, ErrorOperationsTypo, OperationsResTypo} from "@/types/typos.bd";
import { useState, useEffect, useMemo, useCallback } from "react";
import DinamycForm from "@/app/components/ui/form/DinamycForm";

const ProductsPage = () => {
    const [data, setData] = useState<ProductsResponseData[]>([]);
}

export default ProductsPage;
