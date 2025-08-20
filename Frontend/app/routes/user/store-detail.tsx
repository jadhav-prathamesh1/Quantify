import { useParams } from "react-router";
import { UserLayout } from "~/components/UserLayout";
import StoreDetail from "~/features/user/components/StoreDetail";

export async function loader() {
  // Return empty data since StoreDetail handles its own data loading
  return {};
}

export function meta() {
  return [
    { title: "Store Details - Quantify" },
    { name: "description", content: "View store details and reviews" },
  ];
}

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <UserLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Store not found</h1>
          <p className="text-gray-600 mt-2">The store you're looking for doesn't exist.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <StoreDetail storeId={parseInt(id)} />
    </UserLayout>
  );
}
