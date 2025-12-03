const API_BASE_URL = 'http://localhost:8000';

export async function getRecommendations(userId: number, history: string[] = []) {
    try {
        const response = await fetch(`${API_BASE_URL}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                history: history,
                top_k: 10
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        return data.recommendations;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}
