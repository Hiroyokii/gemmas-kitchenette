import { useEffect, useState } from "react";

import { getTodayMenu } from "../../services/dailyMenu.service";

export default function LoginPage() {

    const [menu, setMenu] = 
    useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        async function fetchMenu() {

            try {

                const data = 
                    await getTodayMenu();
                
                setMenu(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        }

        fetchMenu();
    }, []);

    if (loading) {
        return <p>Loading today's menu...</p>;
    }

    if (menu.length === 0) {
        return (
            <p>
                No food has been prepared today.
            </p>
        )
    }

    return (
        <div className="space-y-4">

            <h1 className="text-3xl font-bold">
                Today's Menu
            </h1>

            {menu.map((item: any) => (

                <div
                    key={item.id}
                    className="border rounded p-4"
                >

                    <h2 className="font-bold">
                        {item.food.name}
                    </h2>

                    <p>
                        ₱{item.food.price}
                    </p>

                    <p>
                        Remaining:
                        {" "}
                        {item.remainingServings}
                    </p>
                    
                </div>
                
            ))}

        </div>
    );
}